from rest_framework import serializers
from pallot.models.pallotLocation import Chamber, Floor, Pocket
from backend.AuditSerializerMixin import AuditSerializerMixin

class ChamberSerializer(AuditSerializerMixin, serializers.ModelSerializer):
    class Meta:
        model = Chamber
        fields = "__all__"


class FloorSerializer(AuditSerializerMixin, serializers.ModelSerializer):
    class Meta:
        model = Floor
        fields = "__all__"


class PocketSerializer(AuditSerializerMixin, serializers.ModelSerializer):
    class Meta:
        model = Pocket
        fields = "__all__"