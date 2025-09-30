from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from essential_settings.permissions import SettingsModulePermission
from essential_settings.serializers.bagTypeSerializers import BagTypeSerializer
from essential_settings.models.bagType import BagType
from rest_framework.authentication import TokenAuthentication

class BagTypeViewSet(viewsets.ModelViewSet):
    queryset = BagType.objects.all()
    serializer_class = BagTypeSerializer
    permission_classes = [IsAuthenticated, SettingsModulePermission]
    module_name = "bag_type"

