from django.urls import path, include
from rest_framework.routers import DefaultRouter
from essential_settings.views.bagTypeView import BagTypeViewSet
from essential_settings.views.basicSettingsView import BasicSettingViewSet
from essential_settings.views.generalSettingsView import GeneralSettingViewSet
from essential_settings.views.transactionSettingsView import TransactionSettingViewSet
from essential_settings.views.permissionView import SettingsPermissionListView

router = DefaultRouter()

# register viewsets
router.register(r'bag-types', BagTypeViewSet, basename='bag_type')
router.register(r'basic-settings', BasicSettingViewSet, basename='basic_settings')
router.register(r'general-settings', GeneralSettingViewSet, basename='general_settings')
router.register(r'transaction-settings', TransactionSettingViewSet, basename='transaction_settings')

urlpatterns = [
    path("", include(router.urls)),
    path("permissions/", SettingsPermissionListView.as_view(), name="essential_settings-permissions"),
]
