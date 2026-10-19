from django.db.models import Q
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.generics import CreateAPIView
from rest_framework.response import Response

from .models import Fabric, Roll, StockMovement
from .serializers import (
    FabricSerializer,
    OpeningStockSerializer,
    RollSerializer,
    SellingPriceSerializer,
    StockMovementSerializer,
)


class FabricViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = FabricSerializer
    queryset = Fabric.objects.prefetch_related("fabric_colors").all()
    http_method_names = ("get", "post", "patch", "head", "options")

    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get("search", "").strip()
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search)
                | Q(article__icontains=search)
                | Q(category__icontains=search)
                | Q(brand__icontains=search)
            )
        return queryset


class RollViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = RollSerializer
    queryset = Roll.objects.select_related("fabric_color__fabric").prefetch_related(
        "purchase_items__purchase__supplier"
    )

    def get_queryset(self):
        queryset = super().get_queryset().exclude(status=Roll.Status.CANCELLED)
        search = self.request.query_params.get("search", "").strip()
        roll_status = self.request.query_params.get("status", "").strip().upper()
        if search:
            queryset = queryset.filter(
                Q(roll_number__icontains=search)
                | Q(barcode__icontains=search)
                | Q(fabric_color__fabric__name__icontains=search)
                | Q(fabric_color__fabric__article__icontains=search)
                | Q(fabric_color__name__icontains=search)
            )
        if roll_status:
            queryset = queryset.filter(status=roll_status)
        return queryset

    @action(detail=False, methods=("get",), url_path=r"by-barcode/(?P<barcode>[^/.]+)")
    def by_barcode(self, request, barcode=None):
        roll = self.get_queryset().filter(barcode=barcode).first()
        if roll is None:
            return Response({"detail": "Roll not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(self.get_serializer(roll).data)

    @action(detail=False, methods=("post",), url_path="selling-price")
    def selling_price(self, request):
        serializer = SellingPriceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.save())


class OpeningStockCreateView(CreateAPIView):
    serializer_class = OpeningStockSerializer


class StockMovementViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = StockMovementSerializer
    queryset = StockMovement.objects.select_related("roll", "created_by").all()

    def get_queryset(self):
        queryset = super().get_queryset()
        roll_id = self.request.query_params.get("roll")
        return queryset.filter(roll_id=roll_id) if roll_id else queryset
