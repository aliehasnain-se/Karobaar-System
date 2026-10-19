from django.contrib import admin

from .models import Supplier, SupplierLedgerEntry

admin.site.register(Supplier)
admin.site.register(SupplierLedgerEntry)
