# party_type/serializers/party_typeSerializers.py
from rest_framework import serializers

from essential_settings.models.bagType import BagType
from backend.AuditSerializerMixin import AuditSerializerMixin

class BagTypeSerializer(AuditSerializerMixin, serializers.ModelSerializer):
    class Meta:
        model = BagType
        fields = [
            "id",
            "session",
            "name",
            "per_bag_rent",
            "per_kg_rent",
            "agent_bag_rent",
            "agent_kg_rent",
            "party_bag_rent",
            "party_kg_rent",
            "per_bag_loan",
            "empty_bag_rate",
            "fan_charge",
            # "is_default",
            "is_active",
            "created_at",  # AuditMixin থেকে
            # "updated_at",  # AuditMixin থেকে
        ]
        
        
