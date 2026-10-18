from django.test import SimpleTestCase
from django.urls import reverse
from rest_framework import status


class HealthCheckTests(SimpleTestCase):
    def test_health_check_is_public(self):
        response = self.client.get(reverse("health-check"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "ok")
