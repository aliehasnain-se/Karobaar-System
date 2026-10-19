from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("inventory", "0003_remove_roll_inventory_roll_quantity_positive_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="roll",
            name="status",
            field=models.CharField(
                choices=[
                    ("AVAILABLE", "Available"),
                    ("SOLD", "Sold"),
                    ("RETURNED", "Returned"),
                    ("DAMAGED", "Damaged"),
                    ("CANCELLED", "Cancelled"),
                ],
                default="AVAILABLE",
                max_length=20,
            ),
        ),
    ]
