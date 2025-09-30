# party_type/serializers/party_typeSerializers.py
from rest_framework import serializers

from essential_settings.models.bagType import BagType
from backend.AuditSerializerMixin import AuditSerializerMixin

class BagTypeSerializer(AuditSerializerMixin, serializers.ModelSerializer):
    class Meta:
        model = BagType
        fields = "__all__"
        
        
