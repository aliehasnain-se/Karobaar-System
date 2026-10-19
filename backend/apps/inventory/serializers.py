from decimal import Decimal

from django.db import transaction
from django.db.models import Sum
from rest_framework import serializers

from .models import Fabric, FabricColor, Roll, StockMovement


class FabricSerializer(serializers.ModelSerializer):
    colors = serializers.SerializerMethodField()
    rolls = serializers.SerializerMethodField()
    total_meters = serializers.SerializerMethodField()

    class Meta:
        model = Fabric
        validators = []
        fields = (
            "id",
            "name",
            "article",
            "category",
            "brand",
            "is_active",
            "colors",
            "rolls",
            "total_meters",
        )
        read_only_fields = ("colors", "rolls", "total_meters")

    def validate_article(self, value):
        article = value.strip().upper()
        matches = Fabric.objects.filter(article__iexact=article)
        if self.instance:
            matches = matches.exclude(pk=self.instance.pk)
        if matches.exists():
            raise serializers.ValidationError(
                "A fabric with this article code already exists. Select it from the fabric list."
            )
        return article

    def get_colors(self, obj) -> int:
        return obj.fabric_colors.count()

    def get_rolls(self, obj) -> int:
        return Roll.objects.filter(fabric_color__fabric=obj, status=Roll.Status.AVAILABLE).count()

    def get_total_meters(self, obj) -> Decimal:
        total = Roll.objects.filter(
            fabric_color__fabric=obj,
            status=Roll.Status.AVAILABLE,
        ).aggregate(total=Sum("remaining_meters"))["total"]
        return total or Decimal("0.00")


class RollSerializer(serializers.ModelSerializer):
    fabric_id = serializers.IntegerField(source="fabric_color.fabric_id", read_only=True)
    fabric = serializers.CharField(source="fabric_color.fabric.name", read_only=True)
    article = serializers.CharField(source="fabric_color.fabric.article", read_only=True)
    brand = serializers.CharField(source="fabric_color.fabric.brand", read_only=True)
    color = serializers.CharField(source="fabric_color.name", read_only=True)
    status_label = serializers.CharField(source="get_status_display", read_only=True)
    purchase_item_id = serializers.SerializerMethodField()
    purchase_number = serializers.SerializerMethodField()
    supplier = serializers.SerializerMethodField()

    class Meta:
        model = Roll
        fields = (
            "id",
            "roll_number",
            "barcode",
            "fabric_id",
            "fabric",
            "article",
            "brand",
            "color",
            "original_meters",
            "remaining_meters",
            "cost_total",
            "selling_price",
            "status",
            "status_label",
            "purchase_item_id",
            "purchase_number",
            "supplier",
            "created_at",
        )
        read_only_fields = fields

    @staticmethod
    def _purchase_item(obj):
        if not hasattr(obj, "_resolved_purchase_item"):
            obj._resolved_purchase_item = next(iter(obj.purchase_items.all()), None)
        return obj._resolved_purchase_item

    def get_purchase_item_id(self, obj):
        item = self._purchase_item(obj)
        return item.id if item else None

    def get_purchase_number(self, obj):
        item = self._purchase_item(obj)
        return item.purchase.number if item else None

    def get_supplier(self, obj):
        item = self._purchase_item(obj)
        return item.purchase.supplier.name if item else None


class StockMovementSerializer(serializers.ModelSerializer):
    roll_number = serializers.CharField(source="roll.roll_number", read_only=True)
    movement_label = serializers.CharField(source="get_movement_type_display", read_only=True)
    created_by = serializers.CharField(source="created_by.username", read_only=True)

    class Meta:
        model = StockMovement
        fields = (
            "id",
            "roll",
            "roll_number",
            "movement_type",
            "movement_label",
            "meters",
            "note",
            "created_by",
            "created_at",
        )
        read_only_fields = fields


class SellingPriceSerializer(serializers.Serializer):
    purchase_item_id = serializers.IntegerField(min_value=1, required=False)
    roll_id = serializers.PrimaryKeyRelatedField(
        queryset=Roll.objects.all(),
        required=False,
        source="roll",
    )
    price = serializers.DecimalField(
        max_digits=14,
        decimal_places=2,
        min_value=Decimal("0.01"),
    )

    def validate(self, attrs):
        if bool(attrs.get("purchase_item_id")) == bool(attrs.get("roll")):
            raise serializers.ValidationError(
                "Select either a purchase batch or one opening-stock thaan."
            )
        return attrs

    def save(self, **kwargs):
        if purchase_item_id := self.validated_data.get("purchase_item_id"):
            rolls = Roll.objects.filter(
                purchase_items__id=purchase_item_id,
                status=Roll.Status.AVAILABLE,
            ).distinct()
        else:
            rolls = Roll.objects.filter(
                pk=self.validated_data["roll"].pk,
                status=Roll.Status.AVAILABLE,
            )
        updated = rolls.update(selling_price=self.validated_data["price"])
        if not updated:
            raise serializers.ValidationError(
                "No available thaans were found for this stock batch."
            )
        return {
            "updated_thaans": updated,
            "selling_price": self.validated_data["price"],
        }


class OpeningStockSerializer(serializers.Serializer):
    fabric_id = serializers.PrimaryKeyRelatedField(
        queryset=Fabric.objects.filter(is_active=True),
        required=False,
        allow_null=True,
    )
    fabric_name = serializers.CharField(max_length=150, required=False)
    article = serializers.CharField(max_length=80, required=False)
    category = serializers.CharField(max_length=100, required=False)
    brand = serializers.CharField(max_length=120, required=False)
    color = serializers.CharField(max_length=80)
    meters = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        min_value=Decimal("0.01"),
    )
    purchase_cost = serializers.DecimalField(
        max_digits=14,
        decimal_places=2,
        min_value=Decimal("0.00"),
    )
    price = serializers.DecimalField(
        max_digits=14,
        decimal_places=2,
        min_value=Decimal("0.00"),
    )
    roll_number = serializers.CharField(max_length=40, required=False, allow_blank=True)

    def validate_roll_number(self, value):
        value = value.strip().upper()
        if value and Roll.objects.filter(roll_number__iexact=value).exists():
            raise serializers.ValidationError("This roll number already exists.")
        return value

    def validate(self, attrs):
        if not attrs.get("fabric_id"):
            required = ("fabric_name", "article", "category", "brand")
            missing = [field for field in required if not attrs.get(field)]
            if missing:
                raise serializers.ValidationError(
                    {field: "Required for a new fabric." for field in missing}
                )
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        fabric = validated_data.pop("fabric_id", None)
        if fabric is None:
            article = validated_data.pop("article").strip().upper()
            fabric = Fabric.objects.filter(article__iexact=article).first()
            if fabric is None:
                fabric = Fabric.objects.create(
                    name=validated_data.pop("fabric_name").strip(),
                    article=article,
                    category=validated_data.pop("category").strip(),
                    brand=validated_data.pop("brand").strip(),
                )
        color_name = validated_data.pop("color").strip()
        color = FabricColor.objects.filter(fabric=fabric, name__iexact=color_name).first()
        if color is None:
            color = FabricColor.objects.create(fabric=fabric, name=color_name)

        meters = validated_data.pop("meters")
        roll = Roll.objects.create(
            fabric_color=color,
            original_meters=meters,
            remaining_meters=meters,
            cost_total=validated_data.pop("purchase_cost"),
            selling_price=validated_data.pop("price"),
            roll_number=validated_data.pop("roll_number", "") or None,
        )
        roll.assign_identifiers()
        StockMovement.objects.create(
            roll=roll,
            movement_type=StockMovement.Type.OPENING,
            meters=meters,
            note="Opening stock",
            created_by=self.context["request"].user,
        )
        return roll

    def to_representation(self, instance):
        return RollSerializer(instance).data
