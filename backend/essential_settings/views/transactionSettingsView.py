# backend/essential_settings/views/transaction_settings.py
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from essential_settings.permissions import SettingsModulePermission
from essential_settings.serializers.transactionSettingsSerializers import TransactionSettingSerializer
from essential_settings.models.transactionSettings import TransactionSetting


class TransactionSettingViewSet(viewsets.ModelViewSet):
    queryset = TransactionSetting.objects.all()
    serializer_class = TransactionSettingSerializer
    permission_classes = [IsAuthenticated, SettingsModulePermission]
    module_name = "transaction_settings"
