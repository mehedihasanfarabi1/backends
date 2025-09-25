from rest_framework import serializers
from products.models.unitSize import UnitSize
from products.models.unit import Unit
from company.models.company import Company
from company.models.business_type import BusinessType
from company.models.factory import Factory
from backend.AuditSerializerMixin import AuditSerializerMixin


class UnitSerializer(AuditSerializerMixin, serializers.ModelSerializer):
    class Meta:
        model = Unit
        fields = ["id", "name", "short_name"]

class UnitSizeSerializer(serializers.ModelSerializer):
    unit = UnitSerializer(read_only=True)
    unit_id = serializers.PrimaryKeyRelatedField(
        queryset=Unit.objects.all(), source="unit", write_only=True
    )
    company_id = serializers.PrimaryKeyRelatedField(
        queryset=Company.objects.all(), source="company", write_only=True, required=False
    )
    business_type_id = serializers.PrimaryKeyRelatedField(
        queryset=BusinessType.objects.all(), source="business_type", write_only=True, required=False
    )
    factory_id = serializers.PrimaryKeyRelatedField(
        queryset=Factory.objects.all(), source="factory", write_only=True, required=False
    )

    class Meta:
        model = UnitSize
        fields = [
            "id",
            "unit",
            "unit_id",
            "company_id",
            "business_type_id",
            "factory_id",
            "size_name",
            "uom_weight",
            "created_at",
        ]
