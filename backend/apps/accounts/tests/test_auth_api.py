from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class AuthenticationApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="owner", password="Strong-Test-Pass-123!")

    def test_owner_can_login_refresh_and_read_profile(self):
        login = self.client.post(
            reverse("auth-login"), {"username": "owner", "password": "Strong-Test-Pass-123!"}
        )
        self.assertEqual(login.status_code, status.HTTP_200_OK)
        self.assertIn("access", login.data)
        self.assertNotIn("refresh", login.data)
        self.assertIn("karobaar_refresh", login.cookies)

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")
        profile = self.client.get(reverse("auth-me"))
        self.assertEqual(profile.status_code, status.HTTP_200_OK)
        self.assertEqual(profile.data["role"], "OWNER")

        self.client.credentials()
        refreshed = self.client.post(reverse("auth-refresh"))
        self.assertEqual(refreshed.status_code, status.HTTP_200_OK)
        self.assertIn("access", refreshed.data)

    def test_invalid_login_is_rejected(self):
        response = self.client.post(
            reverse("auth-login"), {"username": "owner", "password": "wrong"}
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
