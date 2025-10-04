# backend/essential_settings/views/general_settings.py
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from essential_settings.permissions import SettingsModulePermission
from essential_settings.serializers.generalSettingsSerializers import GeneralSettingSerializer
from essential_settings.models.generalSettings import GeneralSetting


class GeneralSettingViewSet(viewsets.ModelViewSet):
    queryset = GeneralSetting.objects.all()
    serializer_class = GeneralSettingSerializer
    permission_classes = [IsAuthenticated, SettingsModulePermission]
    module_name = "general_settings"
