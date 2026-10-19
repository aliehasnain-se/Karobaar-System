from decimal import Decimal

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.inventory.models import Fabric, Roll, StockMovement
from apps.purchases.models import Purchase
from apps.suppliers.models import Supplier, SupplierLedgerEntry

User = get_user_model()


class PurchaseApiTests(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user(username="owner", password="Strong-Test-Pass-123!")
        self.client.force_authenticate(self.owner)
        self.supplier = Supplier.objects.create(name="Noor Fabrics", phone="03001234567")
        self.fabric = Fabric.objects.create(
            name="Wash & Wear Premium",
            article="WW-101",
            category="Wash & Wear",
            brand="Noor Mills",
        )

    def payload(self, **overrides):
        payload = {
            "supplier": self.supplier.pk,
            "supplier_invoice_number": "NF-8841",
            "purchase_date": "2026-10-18",
            "paid_amount": "25000.00",
            "items": [
                {
                    "fabric_id": self.fabric.pk,
                    "color": "Navy Blue",
                    "thaan_quantity": 3,
                    "meters_per_thaan": "80.50",
                    "price_per_thaan": "25000.00",
                }
            ],
        }
        payload.update(overrides)
        return payload

    def test_create_purchase_creates_separate_thaans_stock_and_supplier_ledger(self):
        response = self.client.post(reverse("purchase-list"), self.payload(), format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        purchase = Purchase.objects.get()
        self.assertEqual(purchase.total_amount, Decimal("75000.00"))
        self.assertEqual(response.data["total_thaans"], 3)
        self.assertEqual(Decimal(response.data["total_meters"]), Decimal("241.50"))
        self.assertEqual(response.data["status"], "Partial")
        self.assertEqual(Roll.objects.count(), 3)
        self.assertEqual(StockMovement.objects.filter(movement_type="PURCHASE").count(), 3)
        self.assertTrue(all(roll.cost_total == Decimal("25000.00") for roll in Roll.objects.all()))
        self.assertEqual(SupplierLedgerEntry.objects.count(), 2)

        inventory = self.client.get(reverse("roll-list"))
        batch_ids = {roll["purchase_item_id"] for roll in inventory.data}
        self.assertEqual(len(batch_ids), 1)
        self.assertEqual(inventory.data[0]["purchase_number"], purchase.number)
        self.assertEqual(inventory.data[0]["brand"], "Noor Mills")
        self.assertEqual(inventory.data[0]["supplier"], "Noor Fabrics")

        supplier = self.client.get(reverse("supplier-detail", kwargs={"pk": self.supplier.pk}))
        self.assertEqual(Decimal(supplier.data["balance"]), Decimal("50000.00"))

        priced = self.client.post(
            reverse("roll-selling-price"),
            {
                "purchase_item_id": response.data["items"][0]["id"],
                "price": "32000.00",
            },
            format="json",
        )
        self.assertEqual(priced.status_code, status.HTTP_200_OK)
        self.assertEqual(priced.data["updated_thaans"], 3)
        self.assertFalse(Roll.objects.exclude(selling_price=Decimal("32000.00")).exists())

    def test_paid_purchase_has_no_supplier_balance(self):
        response = self.client.post(
            reverse("purchase-list"),
            self.payload(paid_amount="75000.00"),
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["status"], "Paid")
        supplier = self.client.get(reverse("supplier-detail", kwargs={"pk": self.supplier.pk}))
        self.assertEqual(Decimal(supplier.data["balance"]), Decimal("0.00"))

    def test_unused_purchase_can_be_cancelled_without_deleting_its_record(self):
        created = self.client.post(reverse("purchase-list"), self.payload(), format="json")
        number = created.data["number"]

        cancelled = self.client.post(
            reverse("purchase-cancel", kwargs={"number": number}),
            {},
            format="json",
        )

        self.assertEqual(cancelled.status_code, status.HTTP_200_OK)
        self.assertEqual(cancelled.data["status"], "Cancelled")
        self.assertTrue(Purchase.objects.get(number=number).is_cancelled)
        self.assertEqual(Roll.objects.filter(status=Roll.Status.CANCELLED).count(), 3)
        self.assertEqual(len(self.client.get(reverse("roll-list")).data), 0)
        supplier = self.client.get(reverse("supplier-detail", kwargs={"pk": self.supplier.pk}))
        self.assertEqual(Decimal(supplier.data["total_purchases"]), Decimal("0.00"))
        self.assertEqual(Decimal(supplier.data["total_paid"]), Decimal("0.00"))
        self.assertEqual(Decimal(supplier.data["balance"]), Decimal("0.00"))
        ledger = self.client.get(reverse("supplier-ledger", kwargs={"pk": self.supplier.pk}))
        self.assertEqual(len(ledger.data), 0)

    def test_purchase_with_used_stock_cannot_be_cancelled(self):
        created = self.client.post(reverse("purchase-list"), self.payload(), format="json")
        number = created.data["number"]
        roll = Roll.objects.first()
        roll.remaining_meters = Decimal("40.00")
        roll.save(update_fields=("remaining_meters",))

        cancelled = self.client.post(
            reverse("purchase-cancel", kwargs={"number": number}),
            {},
            format="json",
        )

        self.assertEqual(cancelled.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(Purchase.objects.get(number=number).is_cancelled)

    def test_overpayment_and_duplicate_supplier_invoice_are_rejected(self):
        overpayment = self.client.post(
            reverse("purchase-list"),
            self.payload(paid_amount="75000.01"),
            format="json",
        )
        self.assertEqual(overpayment.status_code, status.HTTP_400_BAD_REQUEST)

        first = self.client.post(reverse("purchase-list"), self.payload(), format="json")
        duplicate = self.client.post(reverse("purchase-list"), self.payload(), format="json")
        self.assertEqual(first.status_code, status.HTTP_201_CREATED)
        self.assertEqual(duplicate.status_code, status.HTTP_400_BAD_REQUEST)

    def test_purchase_list_search_detail_and_authentication(self):
        created = self.client.post(reverse("purchase-list"), self.payload(), format="json")
        number = created.data["number"]
        searched = self.client.get(reverse("purchase-list"), {"search": "Noor"})
        detail = self.client.get(reverse("purchase-detail", kwargs={"number": number}))
        self.assertEqual(len(searched.data), 1)
        self.assertEqual(detail.data["number"], number)

        self.client.force_authenticate(user=None)
        unauthorized = self.client.get(reverse("purchase-list"))
        self.assertEqual(unauthorized.status_code, status.HTTP_401_UNAUTHORIZED)
