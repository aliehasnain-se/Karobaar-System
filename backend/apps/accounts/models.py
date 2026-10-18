from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        OWNER = "OWNER", "Owner"

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.OWNER)

    def __str__(self) -> str:
        return self.username
