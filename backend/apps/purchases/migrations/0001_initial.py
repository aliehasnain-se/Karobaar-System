import decimal

import django.core.validators
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("inventory", "0003_remove_roll_inventory_roll_quantity_positive_and_more"),
        ("suppliers", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Purchase",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("number", models.CharField(blank=True, max_length=40, null=True, unique=True)),
                ("supplier_invoice_number", models.CharField(blank=True, max_length=80)),
                ("purchase_date", models.DateField()),
                ("total_amount", models.DecimalField(decimal_places=2, max_digits=14, validators=[django.core.validators.MinValueValidator(decimal.Decimal("0.01"))])),
                ("paid_amount", models.DecimalField(decimal_places=2, default=decimal.Decimal("0.00"), max_digits=14, validators=[django.core.validators.MinValueValidator(decimal.Decimal("0.00"))])),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("created_by", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="purchases", to=settings.AUTH_USER_MODEL)),
                ("supplier", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="purchases", to="suppliers.supplier")),
            ],
            options={"ordering": ("-purchase_date", "-created_at", "-id")},
        ),
        migrations.CreateModel(
            name="PurchaseItem",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("thaan_quantity", models.PositiveIntegerField()),
                ("meters_per_thaan", models.DecimalField(decimal_places=2, max_digits=12, validators=[django.core.validators.MinValueValidator(decimal.Decimal("0.01"))])),
                ("price_per_thaan", models.DecimalField(decimal_places=2, max_digits=14, validators=[django.core.validators.MinValueValidator(decimal.Decimal("0.01"))])),
                ("fabric_color", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="purchase_items", to="inventory.fabriccolor")),
                ("purchase", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="items", to="purchases.purchase")),
                ("rolls", models.ManyToManyField(blank=True, related_name="purchase_items", to="inventory.roll")),
            ],
            options={"ordering": ("id",)},
        ),
        migrations.AddConstraint(
            model_name="purchase",
            constraint=models.UniqueConstraint(condition=models.Q(("supplier_invoice_number", ""), _negated=True), fields=("supplier", "supplier_invoice_number"), name="purchases_unique_supplier_invoice"),
        ),
        migrations.AddConstraint(
            model_name="purchase",
            constraint=models.CheckConstraint(condition=models.Q(("paid_amount__lte", models.F("total_amount"))), name="purchases_paid_lte_total"),
        ),
        migrations.AddConstraint(
            model_name="purchaseitem",
            constraint=models.CheckConstraint(condition=models.Q(("thaan_quantity__gt", 0)), name="purchases_item_quantity_positive"),
        ),
    ]
