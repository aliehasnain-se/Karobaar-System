from decimal import Decimal

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.inventory.models import Fabric, Roll, StockMovement

User = get_user_model()


class InventoryApiTests(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user(username="owner", password="Strong-Test-Pass-123!")
        self.client.force_authenticate(self.owner)

    def test_opening_stock_creates_fabric_roll_barcode_and_movement(self):
        response = self.client.post(
            reverse("opening-stock"),
            {
                "fabric_name": "Wash & Wear Premium",
                "article": "WW-101",
                "category": "Wash & Wear",
                "brand": "Classic Textiles",
                "color": "Navy Blue",
                "meters": "82.50",
                "purchase_cost": "41250.00",
                "price": "51562.50",
            },
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Fabric.objects.count(), 1)
        roll = Roll.objects.get()
        self.assertEqual(roll.remaining_meters, Decimal("82.50"))
        self.assertEqual(roll.cost_total, Decimal("41250.00"))
        self.assertEqual(roll.selling_price, Decimal("51562.50"))
        self.assertTrue(roll.roll_number.startswith("TH-"))
        self.assertTrue(roll.barcode.startswith("8909"))
        self.assertEqual(
            StockMovement.objects.filter(roll=roll, movement_type="OPENING").count(), 1
        )

    def test_owner_can_create_fabric_for_a_purchase(self):
        response = self.client.post(
            reverse("fabric-list"),
            {
                "name": "Cotton Soft Finish",
                "article": "CT-205",
                "category": "Cotton",
                "brand": "Noor Mills",
            },
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["article"], "CT-205")

    def test_duplicate_fabric_article_is_rejected_with_clear_message(self):
        Fabric.objects.create(
            name="Cotton Soft Finish",
            article="CT-205",
            category="Cotton",
            brand="Noor Mills",
        )
        response = self.client.post(
            reverse("fabric-list"),
            {
                "name": "Cotton Soft Finish",
                "article": "ct-205",
                "category": "Cotton",
                "brand": "Noor Mills",
            },
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        details = response.data["error"]["details"]
        self.assertIn("already exists", details["article"][0])
        self.assertEqual(Fabric.objects.count(), 1)

    def test_existing_fabric_can_be_used(self):
        fabric = Fabric.objects.create(
            name="Cotton", article="CT-1", category="Cotton", brand="Mill"
        )
        response = self.client.post(
            reverse("opening-stock"),
            {
                "fabric_id": fabric.id,
                "color": "White",
                "meters": "100.00",
                "purchase_cost": "30000.00",
                "price": "40000.00",
            },
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Roll.objects.get().original_meters, Decimal("100.00"))
        self.assertEqual(Roll.objects.get().cost_total, Decimal("30000.00"))

    def test_rolls_can_be_searched_and_found_by_barcode(self):
        self.client.post(
            reverse("opening-stock"),
            {
                "fabric_name": "Boski Gold",
                "article": "BK-310",
                "category": "Boski",
                "brand": "Pak Loom",
                "color": "Cream",
                "meters": "80",
                "purchase_cost": "40000",
                "price": "50000",
            },
        )
        roll = Roll.objects.get()
        searched = self.client.get(
            reverse("roll-list"), {"search": "BK-310", "status": "AVAILABLE"}
        )
        self.assertEqual(searched.status_code, status.HTTP_200_OK)
        self.assertEqual(len(searched.data), 1)
        barcode = self.client.get(reverse("roll-by-barcode", kwargs={"barcode": roll.barcode}))
        self.assertEqual(barcode.status_code, status.HTTP_200_OK)
        self.assertEqual(barcode.data["id"], roll.id)

    def test_inventory_requires_login(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(reverse("roll-list"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_duplicate_manual_roll_number_is_rejected(self):
        payload = {
            "fabric_name": "Cotton",
            "article": "CT-9",
            "category": "Cotton",
            "brand": "Mill",
            "color": "White",
            "meters": "50",
            "purchase_cost": "25000",
            "price": "31250",
            "roll_number": "OLD-001",
        }
        first = self.client.post(reverse("opening-stock"), payload)
        second = self.client.post(reverse("opening-stock"), payload)

        self.assertEqual(first.status_code, status.HTTP_201_CREATED)
        self.assertEqual(second.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Roll.objects.filter(roll_number="OLD-001").count(), 1)
