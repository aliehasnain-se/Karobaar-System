from datetime import date
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.suppliers.models import Supplier, SupplierLedgerEntry

User = get_user_model()


class SupplierApiTests(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user(username="owner", password="Strong-Test-Pass-123!")
        self.client.force_authenticate(self.owner)

    def create_supplier(self):
        response = self.client.post(
            reverse("supplier-list"),
            {
                "name": "Noor Fabrics",
                "contact_person": "Salman",
                "phone": "03001234567",
                "city": "Faisalabad",
            },
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        return Supplier.objects.get(pk=response.data["id"])

    def add_purchase_balance(self, supplier, amount=Decimal("100000.00")):
        entry = SupplierLedgerEntry.objects.create(
            supplier=supplier,
            entry_type=SupplierLedgerEntry.Type.PURCHASE,
            amount=amount,
            balance_after=amount,
            entry_date=date(2026, 10, 18),
            note="Test purchase",
            created_by=self.owner,
        )
        entry.assign_reference()
        return entry

    def test_owner_can_create_search_and_edit_supplier(self):
        supplier = self.create_supplier()
        searched = self.client.get(reverse("supplier-list"), {"search": "0300"})
        self.assertEqual(len(searched.data), 1)

        updated = self.client.patch(
            reverse("supplier-detail", kwargs={"pk": supplier.pk}),
            {"city": "Lahore"},
        )
        self.assertEqual(updated.status_code, status.HTTP_200_OK)
        self.assertEqual(updated.data["city"], "Lahore")

    def test_duplicate_supplier_phone_is_rejected_even_with_different_format(self):
        self.create_supplier()
        duplicate = self.client.post(
            reverse("supplier-list"),
            {
                "name": "Another Fabric House",
                "contact_person": "Another person",
                "phone": "+92 300 1234567",
                "city": "Lahore",
            },
        )
        self.assertEqual(duplicate.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Supplier.objects.count(), 1)

    def test_payment_updates_balance_and_ledger(self):
        supplier = self.create_supplier()
        self.add_purchase_balance(supplier)

        payment = self.client.post(
            reverse("supplier-payments", kwargs={"pk": supplier.pk}),
            {"amount": "25000.00", "payment_date": "2026-10-18", "note": "Cash"},
        )
        self.assertEqual(payment.status_code, status.HTTP_201_CREATED)
        self.assertTrue(payment.data["reference"].startswith("PAY-"))

        detail = self.client.get(reverse("supplier-detail", kwargs={"pk": supplier.pk}))
        self.assertEqual(Decimal(detail.data["total_purchases"]), Decimal("100000.00"))
        self.assertEqual(Decimal(detail.data["total_paid"]), Decimal("25000.00"))
        self.assertEqual(Decimal(detail.data["balance"]), Decimal("75000.00"))

        ledger = self.client.get(reverse("supplier-ledger", kwargs={"pk": supplier.pk}))
        self.assertEqual(len(ledger.data), 2)

    def test_payment_cannot_exceed_balance(self):
        supplier = self.create_supplier()
        self.add_purchase_balance(supplier, Decimal("10000.00"))
        response = self.client.post(
            reverse("supplier-payments", kwargs={"pk": supplier.pk}),
            {"amount": "10001.00", "payment_date": "2026-10-18"},
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_supplier_api_requires_login(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(reverse("supplier-list"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
