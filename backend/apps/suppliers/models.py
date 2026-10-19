from decimal import Decimal

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models


class Supplier(models.Model):
    name = models.CharField(max_length=160)
    contact_person = models.CharField(max_length=150, blank=True)
    phone = models.CharField(max_length=30)
    city = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("name", "id")

    def __str__(self) -> str:
        return self.name


class SupplierLedgerEntry(models.Model):
    class Type(models.TextChoices):
        PURCHASE = "PURCHASE", "Purchase"
        PAYMENT = "PAYMENT", "Payment"
        RETURN = "RETURN", "Return"
        ADJUSTMENT = "ADJUSTMENT", "Adjustment"

    supplier = models.ForeignKey(Supplier, related_name="ledger_entries", on_delete=models.PROTECT)
    entry_type = models.CharField(max_length=20, choices=Type.choices)
    reference = models.CharField(max_length=40, unique=True, null=True, blank=True)
    amount = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    balance_after = models.DecimalField(max_digits=14, decimal_places=2)
    entry_date = models.DateField()
    note = models.CharField(max_length=255, blank=True)
    is_void = models.BooleanField(default=False)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="supplier_ledger_entries",
        on_delete=models.PROTECT,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-entry_date", "-created_at", "-id")

    def __str__(self) -> str:
        return f"{self.supplier} - {self.get_entry_type_display()}"

    def assign_reference(self) -> None:
        if self.reference:
            return
        prefix = {
            self.Type.PURCHASE: "PUR",
            self.Type.PAYMENT: "PAY",
            self.Type.RETURN: "RET",
            self.Type.ADJUSTMENT: "ADJ",
        }[self.entry_type]
        self.reference = f"{prefix}-{self.pk:06d}"
        self.save(update_fields=("reference",))
