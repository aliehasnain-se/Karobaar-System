from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from drf_spectacular.utils import extend_schema
from rest_framework import serializers, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import CurrentUserSerializer, LoginSerializer

User = get_user_model()


class AuthResponseSerializer(serializers.Serializer):
    access = serializers.CharField()
    user = CurrentUserSerializer()


def set_refresh_cookie(response: Response, refresh: str) -> None:
    response.set_cookie(
        key=settings.AUTH_COOKIE_NAME,
        value=refresh,
        httponly=True,
        secure=settings.AUTH_COOKIE_SECURE,
        samesite=settings.AUTH_COOKIE_SAMESITE,
        max_age=int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()),
        path="/api/v1/auth/",
    )


class LoginView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    @extend_schema(request=LoginSerializer, responses=AuthResponseSerializer)
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = authenticate(request, **serializer.validated_data)
        if user is None or not user.is_active:
            return Response(
                {"detail": "Invalid username or password."}, status=status.HTTP_401_UNAUTHORIZED
            )

        refresh = RefreshToken.for_user(user)
        response = Response(
            {"access": str(refresh.access_token), "user": CurrentUserSerializer(user).data}
        )
        set_refresh_cookie(response, str(refresh))
        return response


class RefreshView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    @extend_schema(request=None, responses=AuthResponseSerializer)
    def post(self, request):
        raw_refresh = request.COOKIES.get(settings.AUTH_COOKIE_NAME)
        if not raw_refresh:
            return Response({"detail": "Login required."}, status=status.HTTP_401_UNAUTHORIZED)
        try:
            old_refresh = RefreshToken(raw_refresh)
            user = User.objects.get(pk=old_refresh["user_id"], is_active=True)
            old_refresh.blacklist()
            new_refresh = RefreshToken.for_user(user)
        except (TokenError, User.DoesNotExist):
            return Response({"detail": "Session expired."}, status=status.HTTP_401_UNAUTHORIZED)

        response = Response(
            {"access": str(new_refresh.access_token), "user": CurrentUserSerializer(user).data}
        )
        set_refresh_cookie(response, str(new_refresh))
        return response


class LogoutView(APIView):
    @extend_schema(request=None, responses={204: None})
    def post(self, request):
        raw_refresh = request.COOKIES.get(settings.AUTH_COOKIE_NAME)
        if raw_refresh:
            try:
                RefreshToken(raw_refresh).blacklist()
            except TokenError:
                pass
        response = Response(status=status.HTTP_204_NO_CONTENT)
        response.delete_cookie(settings.AUTH_COOKIE_NAME, path="/api/v1/auth/")
        return response


class CurrentUserView(APIView):
    @extend_schema(responses=CurrentUserSerializer)
    def get(self, request):
        return Response(CurrentUserSerializer(request.user).data)
