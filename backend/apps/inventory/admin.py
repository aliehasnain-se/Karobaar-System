from django.contrib import admin

from .models import Fabric, FabricColor, Roll, StockMovement

admin.site.register(Fabric)
admin.site.register(FabricColor)
admin.site.register(Roll)
admin.site.register(StockMovement)
