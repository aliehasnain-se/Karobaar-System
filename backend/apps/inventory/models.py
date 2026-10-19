from decimal import Decimal

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models
from django.db.models.functions import Lower


class Fabric(models.Model):
    name = models.CharField(max_length=150)
    article = models.CharField(max_length=80)
    category = models.CharField(max_length=100)
    brand = models.CharField(max_length=120)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("name",)
        constraints = [
            models.UniqueConstraint(Lower("article"), name="inventory_unique_fabric_article_ci")
        ]

    def __str__(self) -> str:
        return f"{self.article} - {self.name}"


class FabricColor(models.Model):
    fabric = models.ForeignKey(Fabric, related_name="fabric_colors", on_delete=models.PROTECT)
    name = models.CharField(max_length=80)

    class Meta:
        ordering = ("name",)
        constraints = [
            models.UniqueConstraint(
                Lower("name"), "fabric", name="inventory_unique_fabric_color_ci"
            )
        ]

    def __str__(self) -> str:
        return f"{self.fabric.article} - {self.name}"


class Roll(models.Model):
    class Status(models.TextChoices):
        AVAILABLE = "AVAILABLE", "Available"
        SOLD = "SOLD", "Sold"
        RETURNED = "RETURNED", "Returned"
        DAMAGED = "DAMAGED", "Damaged"
        CANCELLED = "CANCELLED", "Cancelled"

    fabric_color = models.ForeignKey(FabricColor, related_name="rolls", on_delete=models.PROTECT)
    roll_number = models.CharField(max_length=40, unique=True, null=True, blank=True)
    barcode = models.CharField(max_length=80, unique=True, null=True, blank=True)
    selling_price = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))],
    )
    original_meters = models.DecimalField(
        max_digits=12, decimal_places=2, validators=[MinValueValidator(Decimal("0.01"))]
    )
    remaining_meters = models.DecimalField(
        max_digits=12, decimal_places=2, validators=[MinValueValidator(Decimal("0.00"))]
    )
    cost_total = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))],
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.AVAILABLE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at", "-id")
        constraints = [
            models.CheckConstraint(
                condition=models.Q(original_meters__gt=0), name="inventory_roll_original_positive"
            ),
            models.CheckConstraint(
                condition=models.Q(remaining_meters__gte=0),
                name="inventory_roll_remaining_nonnegative",
            ),
            models.CheckConstraint(
                condition=models.Q(remaining_meters__lte=models.F("original_meters")),
                name="inventory_roll_remaining_lte_original",
            ),
        ]

    def __str__(self) -> str:
        return self.roll_number or f"Roll {self.pk}"

    def assign_identifiers(self) -> None:
        updates = []
        if not self.roll_number:
            self.roll_number = f"TH-{self.pk:06d}"
            updates.append("roll_number")
        if not self.barcode:
            self.barcode = f"8909{self.pk:08d}"
            updates.append("barcode")
        if updates:
            self.save(update_fields=updates)


class StockMovement(models.Model):
    class Type(models.TextChoices):
        OPENING = "OPENING", "Opening stock"
        PURCHASE = "PURCHASE", "Purchase"
        SALE = "SALE", "Sale"
        RETURN = "RETURN", "Return"
        DAMAGE = "DAMAGE", "Damage"
        ADJUSTMENT = "ADJUSTMENT", "Adjustment"

    roll = models.ForeignKey(Roll, related_name="movements", on_delete=models.PROTECT)
    movement_type = models.CharField(max_length=20, choices=Type.choices)
    meters = models.DecimalField(max_digits=12, decimal_places=2)
    note = models.CharField(max_length=255, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="stock_movements", on_delete=models.PROTECT
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at", "-id")

    def __str__(self) -> str:
        return f"{self.roll} - {self.get_movement_type_display()}"
