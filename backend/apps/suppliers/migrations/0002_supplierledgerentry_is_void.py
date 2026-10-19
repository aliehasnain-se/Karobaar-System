from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("suppliers", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="supplierledgerentry",
            name="is_void",
            field=models.BooleanField(default=False),
        ),
    ]
