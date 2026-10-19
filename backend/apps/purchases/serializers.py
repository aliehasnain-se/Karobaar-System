from decimal import Decimal

from django.db import transaction
from django.db.models import Q
from rest_framework import serializers

from apps.inventory.models import Fabric, FabricColor, Roll, StockMovement
from apps.suppliers.models import Supplier, SupplierLedgerEntry
from apps.suppliers.serializers import supplier_totals

from .models import Purchase, PurchaseItem


class PurchaseItemInputSerializer(serializers.Serializer):
    fabric_id = serializers.PrimaryKeyRelatedField(
        queryset=Fabric.objects.filter(is_active=True),
        source="fabric",
    )
    color = serializers.CharField(max_length=80)
    thaan_quantity = serializers.IntegerField(min_value=1, max_value=1000)
    meters_per_thaan = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        min_value=Decimal("0.01"),
    )
    price_per_thaan = serializers.DecimalField(
        max_digits=14,
        decimal_places=2,
        min_value=Decimal("0.01"),
    )


class PurchaseRollSerializer(serializers.ModelSerializer):
    class Meta:
        model = Roll
        fields = ("id", "roll_number", "barcode")
        read_only_fields = fields


class PurchaseItemSerializer(serializers.ModelSerializer):
    fabric_id = serializers.IntegerField(source="fabric_color.fabric_id", read_only=True)
    fabric = serializers.CharField(source="fabric_color.fabric.name", read_only=True)
    article = serializers.CharField(source="fabric_color.fabric.article", read_only=True)
    color = serializers.CharField(source="fabric_color.name", read_only=True)
    total_meters = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)
    total_amount = serializers.DecimalField(max_digits=16, decimal_places=2, read_only=True)
    rolls = PurchaseRollSerializer(many=True, read_only=True)

    class Meta:
        model = PurchaseItem
        fields = (
            "id",
            "fabric_id",
            "fabric",
            "article",
            "color",
            "thaan_quantity",
            "meters_per_thaan",
            "price_per_thaan",
            "total_meters",
            "total_amount",
            "rolls",
        )
        read_only_fields = fields


class PurchaseSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source="supplier.name", read_only=True)
    supplier_phone = serializers.CharField(source="supplier.phone", read_only=True)
    status = serializers.CharField(source="payment_status", read_only=True)
    total_thaans = serializers.SerializerMethodField()
    total_meters = serializers.SerializerMethodField()
    balance = serializers.SerializerMethodField()
    items = PurchaseItemSerializer(many=True, read_only=True)

    class Meta:
        model = Purchase
        fields = (
            "id",
            "number",
            "supplier",
            "supplier_name",
            "supplier_phone",
            "supplier_invoice_number",
            "purchase_date",
            "total_thaans",
            "total_meters",
            "total_amount",
            "paid_amount",
            "balance",
            "status",
            "items",
            "created_at",
        )
        read_only_fields = fields

    def get_total_thaans(self, obj) -> int:
        return sum(item.thaan_quantity for item in obj.items.all())

    def get_total_meters(self, obj) -> Decimal:
        return sum((item.total_meters for item in obj.items.all()), Decimal("0.00"))

    def get_balance(self, obj) -> Decimal:
        return obj.total_amount - obj.paid_amount


class PurchaseCreateSerializer(serializers.Serializer):
    supplier = serializers.PrimaryKeyRelatedField(queryset=Supplier.objects.filter(is_active=True))
    supplier_invoice_number = serializers.CharField(
        max_length=80,
        required=False,
        allow_blank=True,
    )
    purchase_date = serializers.DateField()
    paid_amount = serializers.DecimalField(
        max_digits=14,
        decimal_places=2,
        min_value=Decimal("0.00"),
        default=Decimal("0.00"),
    )
    items = PurchaseItemInputSerializer(many=True, allow_empty=False)

    def validate_supplier_invoice_number(self, value):
        return value.strip()

    def validate(self, attrs):
        total = sum(
            (
                item["price_per_thaan"] * item["thaan_quantity"]
                for item in attrs["items"]
            ),
            Decimal("0.00"),
        )
        if attrs["paid_amount"] > total:
            raise serializers.ValidationError(
                {"paid_amount": "Paid amount cannot be greater than the purchase total."}
            )
        invoice = attrs.get("supplier_invoice_number", "")
        if invoice and Purchase.objects.filter(
            supplier=attrs["supplier"],
            supplier_invoice_number__iexact=invoice,
        ).exists():
            raise serializers.ValidationError(
                {"supplier_invoice_number": "This supplier invoice is already recorded."}
            )
        attrs["total_amount"] = total
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        items_data = validated_data.pop("items")
        supplier = Supplier.objects.select_for_update().get(pk=validated_data.pop("supplier").pk)
        old_balance = supplier_totals(supplier)[2]
        purchase = Purchase.objects.create(
            supplier=supplier,
            created_by=self.context["request"].user,
            **validated_data,
        )
        purchase.assign_number()

        for item_data in items_data:
            fabric = item_data["fabric"]
            color_name = item_data["color"].strip()
            color = FabricColor.objects.filter(fabric=fabric, name__iexact=color_name).first()
            if color is None:
                color = FabricColor.objects.create(fabric=fabric, name=color_name)
            item = PurchaseItem.objects.create(
                purchase=purchase,
                fabric_color=color,
                thaan_quantity=item_data["thaan_quantity"],
                meters_per_thaan=item_data["meters_per_thaan"],
                price_per_thaan=item_data["price_per_thaan"],
            )
            rolls = []
            for _ in range(item.thaan_quantity):
                roll = Roll.objects.create(
                    fabric_color=color,
                    original_meters=item.meters_per_thaan,
                    remaining_meters=item.meters_per_thaan,
                    cost_total=item.price_per_thaan,
                )
                roll.assign_identifiers()
                StockMovement.objects.create(
                    roll=roll,
                    movement_type=StockMovement.Type.PURCHASE,
                    meters=item.meters_per_thaan,
                    note=purchase.number,
                    created_by=self.context["request"].user,
                )
                rolls.append(roll)
            item.rolls.add(*rolls)

        SupplierLedgerEntry.objects.create(
            supplier=supplier,
            entry_type=SupplierLedgerEntry.Type.PURCHASE,
            reference=purchase.number,
            amount=purchase.total_amount,
            balance_after=old_balance + purchase.total_amount,
            entry_date=purchase.purchase_date,
            note=f"Purchase {purchase.number}",
            created_by=self.context["request"].user,
        )
        if purchase.paid_amount:
            payment_entry = SupplierLedgerEntry.objects.create(
                supplier=supplier,
                entry_type=SupplierLedgerEntry.Type.PAYMENT,
                amount=purchase.paid_amount,
                balance_after=old_balance + purchase.total_amount - purchase.paid_amount,
                entry_date=purchase.purchase_date,
                note=f"Paid with {purchase.number}",
                created_by=self.context["request"].user,
            )
            payment_entry.assign_reference()
        return purchase

    def to_representation(self, instance):
        instance = Purchase.objects.select_related("supplier").prefetch_related(
            "items__fabric_color__fabric",
            "items__rolls",
        ).get(pk=instance.pk)
        return PurchaseSerializer(instance).data


class PurchaseCancelSerializer(serializers.Serializer):
    @transaction.atomic
    def create(self, validated_data):
        purchase = Purchase.objects.select_for_update().get(
            pk=self.context["purchase"].pk
        )
        if purchase.is_cancelled:
            raise serializers.ValidationError("This purchase is already cancelled.")

        roll_ids = purchase.items.values_list("rolls__id", flat=True)
        rolls = list(Roll.objects.select_for_update().filter(pk__in=roll_ids))
        stock_changed = any(
            roll.status != Roll.Status.AVAILABLE
            or roll.remaining_meters != roll.original_meters
            for roll in rolls
        )
        if stock_changed:
            raise serializers.ValidationError(
                "This purchase cannot be cancelled because some stock has already been used."
            )

        purchase.mark_cancelled(self.context["request"].user)
        Roll.objects.filter(pk__in=[roll.pk for roll in rolls]).update(
            status=Roll.Status.CANCELLED
        )
        SupplierLedgerEntry.objects.filter(supplier=purchase.supplier).filter(
            Q(reference=purchase.number) | Q(note=f"Paid with {purchase.number}")
        ).update(is_void=True)

        return Purchase.objects.select_related("supplier").prefetch_related(
            "items__fabric_color__fabric",
            "items__rolls",
        ).get(pk=purchase.pk)

    def to_representation(self, instance):
        return PurchaseSerializer(instance).data
