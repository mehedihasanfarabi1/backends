from django.urls import path, include
from rest_framework.routers import DefaultRouter
from essential_settings.views.bagTypeView import BagTypeViewSet
from essential_settings.views.permissionView import SettingsPermissionListView

router = DefaultRouter()

router.register(r'bag-types', BagTypeViewSet, basename='bag_type')

urlpatterns = [
    path("", include(router.urls)),
    path("permissions/", SettingsPermissionListView.as_view(), name="essential_settings-permissions"),

]
