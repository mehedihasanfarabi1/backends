# products/serializers/unitConversionSerializer.py
from rest_framework import serializers
from products.models.unitConversion import UnitConversion
from products.models.unit import Unit
from company.models.company import Company
from company.models.business_type import BusinessType
from company.models.factory import Factory

class UnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unit
        fields = ["id", "name", "short_name"]

class UnitConversionSerializer(serializers.ModelSerializer):
    parent_unit_id = serializers.PrimaryKeyRelatedField(
        queryset=Unit.objects.all(), source="parent_unit", write_only=True
    )
    child_unit_id = serializers.PrimaryKeyRelatedField(
        queryset=Unit.objects.all(), source="child_unit", write_only=True
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

    parent_unit = serializers.SerializerMethodField()
    child_unit = serializers.SerializerMethodField()

    class Meta:
        model = UnitConversion
        fields = [
            "id",
            "qty",
            "parent_unit_id",
            "child_unit_id",
            "parent_unit",
            "child_unit",
            "company_id",
            "business_type_id",
            "factory_id",
            "created_at",
        ]

    def get_parent_unit(self, obj):
        return {
            "id": obj.parent_unit.id,
            "unit_name": obj.parent_unit.name,
            "short_name": obj.parent_unit.short_name
        }

    def get_child_unit(self, obj):
        return {
            "id": obj.child_unit.id,
            "unit_name": obj.child_unit.name,
            "short_name": obj.child_unit.short_name
        }
