from decimal import Decimal

from django.db import transaction
from django.db.models import Sum
from django.utils import timezone
from rest_framework import serializers

from .models import Supplier, SupplierLedgerEntry


def normalize_supplier_phone(value: str) -> str:
    digits = "".join(character for character in value if character.isdigit())
    if digits.startswith("0092") and len(digits) == 14:
        return f"0{digits[4:]}"
    if digits.startswith("92") and len(digits) == 12:
        return f"0{digits[2:]}"
    return digits


def supplier_totals(supplier: Supplier) -> tuple[Decimal, Decimal, Decimal]:
    totals = (
        supplier.ledger_entries.filter(is_void=False)
        .values("entry_type")
        .annotate(total=Sum("amount"))
    )
    amounts = {row["entry_type"]: row["total"] for row in totals}
    purchases = amounts.get(SupplierLedgerEntry.Type.PURCHASE, Decimal("0.00"))
    paid = amounts.get(SupplierLedgerEntry.Type.PAYMENT, Decimal("0.00"))
    returns = amounts.get(SupplierLedgerEntry.Type.RETURN, Decimal("0.00"))
    balance = max(Decimal("0.00"), purchases - paid - returns)
    return purchases, paid, balance


class SupplierSerializer(serializers.ModelSerializer):
    total_purchases = serializers.SerializerMethodField()
    total_paid = serializers.SerializerMethodField()
    balance = serializers.SerializerMethodField()
    last_purchase_date = serializers.SerializerMethodField()

    class Meta:
        model = Supplier
        fields = (
            "id",
            "name",
            "contact_person",
            "phone",
            "city",
            "is_active",
            "total_purchases",
            "total_paid",
            "balance",
            "last_purchase_date",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "is_active",
            "total_purchases",
            "total_paid",
            "balance",
            "last_purchase_date",
            "created_at",
            "updated_at",
        )

    def validate(self, attrs):
        phone = attrs.get("phone", getattr(self.instance, "phone", "")).strip()
        normalized_phone = normalize_supplier_phone(phone)
        matches = Supplier.objects.all()
        if self.instance:
            matches = matches.exclude(pk=self.instance.pk)
        if any(
            normalize_supplier_phone(supplier.phone) == normalized_phone
            for supplier in matches
        ):
            raise serializers.ValidationError(
                "This phone number is already used by another supplier."
            )
        return attrs

    @staticmethod
    def _totals(obj: Supplier) -> tuple[Decimal, Decimal, Decimal]:
        if not hasattr(obj, "_supplier_totals"):
            obj._supplier_totals = supplier_totals(obj)
        return obj._supplier_totals

    def get_total_purchases(self, obj) -> Decimal:
        return self._totals(obj)[0]

    def get_total_paid(self, obj) -> Decimal:
        return self._totals(obj)[1]

    def get_balance(self, obj) -> Decimal:
        return self._totals(obj)[2]

    def get_last_purchase_date(self, obj):
        entry = next(
            (
                ledger_entry
                for ledger_entry in obj.ledger_entries.all()
                if not ledger_entry.is_void
                and ledger_entry.entry_type == SupplierLedgerEntry.Type.PURCHASE
            ),
            None,
        )
        return entry.entry_date if entry else None


class SupplierLedgerSerializer(serializers.ModelSerializer):
    type_label = serializers.CharField(source="get_entry_type_display", read_only=True)
    debit = serializers.SerializerMethodField()
    credit = serializers.SerializerMethodField()

    class Meta:
        model = SupplierLedgerEntry
        fields = (
            "id",
            "entry_date",
            "reference",
            "note",
            "entry_type",
            "type_label",
            "debit",
            "credit",
            "balance_after",
        )
        read_only_fields = fields

    def get_debit(self, obj) -> Decimal:
        return (
            obj.amount if obj.entry_type == SupplierLedgerEntry.Type.PURCHASE else Decimal("0.00")
        )

    def get_credit(self, obj) -> Decimal:
        return (
            obj.amount
            if obj.entry_type
            in (
                SupplierLedgerEntry.Type.PAYMENT,
                SupplierLedgerEntry.Type.RETURN,
            )
            else Decimal("0.00")
        )


class SupplierPaymentSerializer(serializers.Serializer):
    amount = serializers.DecimalField(
        max_digits=14,
        decimal_places=2,
        min_value=Decimal("0.01"),
    )
    payment_date = serializers.DateField(default=timezone.localdate)
    note = serializers.CharField(max_length=255, required=False, allow_blank=True)

    def validate_amount(self, amount):
        supplier = self.context["supplier"]
        balance = supplier_totals(supplier)[2]
        if balance <= 0:
            raise serializers.ValidationError("This supplier has no remaining balance.")
        if amount > balance:
            raise serializers.ValidationError(
                "Payment cannot be greater than the remaining balance."
            )
        return amount

    @transaction.atomic
    def create(self, validated_data):
        supplier = Supplier.objects.select_for_update().get(pk=self.context["supplier"].pk)
        balance = supplier_totals(supplier)[2]
        amount = validated_data["amount"]
        if amount > balance:
            raise serializers.ValidationError(
                {"amount": "Payment cannot be greater than the remaining balance."}
            )
        entry = SupplierLedgerEntry.objects.create(
            supplier=supplier,
            entry_type=SupplierLedgerEntry.Type.PAYMENT,
            amount=amount,
            balance_after=balance - amount,
            entry_date=validated_data["payment_date"],
            note=validated_data.get("note", ""),
            created_by=self.context["request"].user,
        )
        entry.assign_reference()
        return entry

    def to_representation(self, instance):
        return SupplierLedgerSerializer(instance).data
