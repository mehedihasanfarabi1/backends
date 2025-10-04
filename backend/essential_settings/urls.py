from django.urls import path, include
from rest_framework.routers import DefaultRouter
from essential_settings.views.bagTypeView import BagTypeViewSet
from essential_settings.views.basicSettingsView import BasicSettings
from essential_settings.views.permissionView import SettingsPermissionListView

router = DefaultRouter()

router.register(r'bag-types', BagTypeViewSet, basename='bag_type')
router.register(r'basic_settings', BasicSettings, basename='basic_settings')

urlpatterns = [
    path("", include(router.urls)),
    path("permissions/", SettingsPermissionListView.as_view(), name="essential_settings-permissions"),

]
