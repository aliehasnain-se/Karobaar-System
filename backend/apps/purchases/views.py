from django.db import models
from django.db.models import Q
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Purchase
from .serializers import PurchaseCancelSerializer, PurchaseCreateSerializer, PurchaseSerializer


class PurchaseViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    lookup_field = "number"
    serializer_class = PurchaseSerializer
    queryset = Purchase.objects.select_related("supplier").prefetch_related(
        "items__fabric_color__fabric",
        "items__rolls",
    )
    http_method_names = ("get", "post", "head", "options")

    def get_serializer_class(self):
        return PurchaseCreateSerializer if self.action == "create" else PurchaseSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get("search", "").strip()
        payment_status = self.request.query_params.get("status", "").strip().lower()
        supplier_id = self.request.query_params.get("supplier")
        if search:
            queryset = queryset.filter(
                Q(number__icontains=search)
                | Q(supplier_invoice_number__icontains=search)
                | Q(supplier__name__icontains=search)
            )
        if supplier_id:
            queryset = queryset.filter(supplier_id=supplier_id)
        if payment_status == "paid":
            queryset = queryset.filter(
                is_cancelled=False,
                paid_amount=models.F("total_amount"),
            )
        elif payment_status == "unpaid":
            queryset = queryset.filter(is_cancelled=False, paid_amount=0)
        elif payment_status == "partial":
            queryset = queryset.filter(
                is_cancelled=False,
                paid_amount__gt=0,
                paid_amount__lt=models.F("total_amount"),
            )
        elif payment_status == "cancelled":
            queryset = queryset.filter(is_cancelled=True)
        return queryset

    @action(detail=True, methods=("post",))
    def cancel(self, request, number=None):
        purchase = self.get_object()
        serializer = PurchaseCancelSerializer(
            data=request.data,
            context={"request": request, "purchase": purchase},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
