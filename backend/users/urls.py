from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (
    RegisterView, UserView, UserListView,
    CustomLoginView, LogoutView,
    UserPermissionViewSet, RoleViewSet, PermissionViewSet,
    RolePermissionViewSet, UserRoleViewSet,
    UserModulePermissionViewSet,UserPermissionSetViewSet
)

# users/urls.py
router = DefaultRouter()
# router.register(r'user-permissions', UserPermissionSetViewSet, basename='user-permissions')  # ✅ User → Permission
# router.register(r'permissions', PermissionViewSet, basename='permissions')              # ✅ Master Permission
router.register(r'roles', RoleViewSet, basename='roles')
router.register(r'role-permissions', RolePermissionViewSet, basename='role-permissions')
router.register(r'user-roles', UserRoleViewSet, basename='user-roles')
# ------------------------------
# Hybrid permission routes
# ------------------------------
router.register(r'permission-sets', UserPermissionSetViewSet, basename='permission-sets')
# router.register(r'module-permissions', UserModulePermissionViewSet, basename='module-permissions')


urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("me/", UserView.as_view(), name="me"),
    path("users/", UserListView.as_view(), name="user-list"),
    path("login/", CustomLoginView.as_view(), name="custom_login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("jwt-login/", TokenObtainPairView.as_view(), name="jwt_login"),
    path("", include(router.urls)),
]
