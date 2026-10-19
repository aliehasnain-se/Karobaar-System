from django.db.models import Q
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Supplier
from .serializers import (
    SupplierLedgerSerializer,
    SupplierPaymentSerializer,
    SupplierSerializer,
)


class SupplierViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = SupplierSerializer
    queryset = Supplier.objects.prefetch_related("ledger_entries").all()
    http_method_names = ("get", "post", "patch", "head", "options")

    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get("search", "").strip()
        active = self.request.query_params.get("active", "true").lower()
        if active != "all":
            queryset = queryset.filter(is_active=active != "false")
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search)
                | Q(contact_person__icontains=search)
                | Q(phone__icontains=search)
                | Q(city__icontains=search)
            )
        return queryset

    @action(detail=True, methods=("get",))
    def ledger(self, request, pk=None):
        supplier = self.get_object()
        entries = supplier.ledger_entries.filter(is_void=False)
        return Response(SupplierLedgerSerializer(entries, many=True).data)

    @action(detail=True, methods=("post",))
    def payments(self, request, pk=None):
        supplier = self.get_object()
        serializer = SupplierPaymentSerializer(
            data=request.data,
            context={"request": request, "supplier": supplier},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
