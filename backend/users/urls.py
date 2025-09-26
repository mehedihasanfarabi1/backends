from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (
    RegisterView, UserViewSet, UserListView,
    CustomLoginView, LogoutView,
     RoleViewSet, PermissionViewSet,UserPermissionSetViewSet
)

# users/urls.py
router = DefaultRouter()

router.register(r'roles', RoleViewSet, basename='roles')

# ------------------------------
# Hybrid permission routes
# ------------------------------
router.register(r'permission-sets', UserPermissionSetViewSet, basename='permission-sets')
router.register(r'users', UserViewSet, basename='user')


urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("me/", UserViewSet.as_view({"get": "me"}), name="me"),  
    path("users/", UserListView.as_view(), name="user-list"),
    path("login/", CustomLoginView.as_view(), name="custom_login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("jwt-login/", TokenObtainPairView.as_view(), name="jwt_login"),
    path("", include(router.urls)),
]
