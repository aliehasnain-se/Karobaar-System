from decimal import Decimal

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models
from django.utils import timezone

from apps.inventory.models import FabricColor, Roll
from apps.suppliers.models import Supplier


class Purchase(models.Model):
    supplier = models.ForeignKey(Supplier, related_name="purchases", on_delete=models.PROTECT)
    number = models.CharField(max_length=40, unique=True, null=True, blank=True)
    supplier_invoice_number = models.CharField(max_length=80, blank=True)
    purchase_date = models.DateField()
    total_amount = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    paid_amount = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))],
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="purchases",
        on_delete=models.PROTECT,
    )
    is_cancelled = models.BooleanField(default=False)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancelled_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="cancelled_purchases",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-purchase_date", "-created_at", "-id")
        constraints = [
            models.UniqueConstraint(
                fields=("supplier", "supplier_invoice_number"),
                condition=~models.Q(supplier_invoice_number=""),
                name="purchases_unique_supplier_invoice",
            ),
            models.CheckConstraint(
                condition=models.Q(paid_amount__lte=models.F("total_amount")),
                name="purchases_paid_lte_total",
            ),
        ]

    def __str__(self) -> str:
        return self.number or f"Purchase {self.pk}"

    @property
    def payment_status(self) -> str:
        if self.is_cancelled:
            return "Cancelled"
        if self.paid_amount <= 0:
            return "Unpaid"
        if self.paid_amount >= self.total_amount:
            return "Paid"
        return "Partial"

    def assign_number(self) -> None:
        if not self.number:
            self.number = f"PUR-{self.pk:06d}"
            self.save(update_fields=("number",))

    def mark_cancelled(self, user) -> None:
        self.is_cancelled = True
        self.cancelled_at = timezone.now()
        self.cancelled_by = user
        self.save(update_fields=("is_cancelled", "cancelled_at", "cancelled_by", "updated_at"))


class PurchaseItem(models.Model):
    purchase = models.ForeignKey(Purchase, related_name="items", on_delete=models.PROTECT)
    fabric_color = models.ForeignKey(
        FabricColor,
        related_name="purchase_items",
        on_delete=models.PROTECT,
    )
    thaan_quantity = models.PositiveIntegerField()
    meters_per_thaan = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    price_per_thaan = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    rolls = models.ManyToManyField(Roll, related_name="purchase_items", blank=True)

    class Meta:
        ordering = ("id",)
        constraints = [
            models.CheckConstraint(
                condition=models.Q(thaan_quantity__gt=0),
                name="purchases_item_quantity_positive",
            )
        ]

    def __str__(self) -> str:
        return f"{self.purchase} - {self.fabric_color}"

    @property
    def total_meters(self) -> Decimal:
        return self.meters_per_thaan * self.thaan_quantity

    @property
    def total_amount(self) -> Decimal:
        return self.price_per_thaan * self.thaan_quantity
