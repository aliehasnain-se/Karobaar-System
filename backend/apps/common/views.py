from drf_spectacular.utils import extend_schema
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import HealthCheckResponseSerializer


class HealthCheckView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    @extend_schema(responses=HealthCheckResponseSerializer)
    def get(self, request):
        return Response({"status": "ok", "service": "karobaar-api", "version": "1.0.0"})
