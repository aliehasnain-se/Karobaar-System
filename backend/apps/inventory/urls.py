from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import FabricViewSet, OpeningStockCreateView, RollViewSet, StockMovementViewSet

router = DefaultRouter()
router.register("fabrics", FabricViewSet, basename="fabric")
router.register("rolls", RollViewSet, basename="roll")
router.register("stock-movements", StockMovementViewSet, basename="stock-movement")

urlpatterns = [
    path("inventory/opening-stock/", OpeningStockCreateView.as_view(), name="opening-stock"),
    path("", include(router.urls)),
]
