from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User


@admin.register(User)
class KarobaarUserAdmin(UserAdmin):
    fieldsets = (*UserAdmin.fieldsets, ("Karobaar access", {"fields": ("role",)}))
    add_fieldsets = (*UserAdmin.add_fieldsets, ("Karobaar access", {"fields": ("role",)}))
    list_display = (*UserAdmin.list_display, "role")
