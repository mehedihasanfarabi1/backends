# backend/essential_settings/views/basic_settings.py
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from essential_settings.permissions import SettingsModulePermission
from essential_settings.serializers.basicSettingsSerializers import BasicSettingSerializer
from essential_settings.models.basicSettings import BasicSetting


class BasicSettingViewSet(viewsets.ModelViewSet):
    queryset = BasicSetting.objects.all()
    serializer_class = BasicSettingSerializer
    permission_classes = [IsAuthenticated, SettingsModulePermission]
    module_name = "basic_settings"
