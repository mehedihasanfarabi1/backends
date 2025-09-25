from rest_framework import serializers
from company.models import Factory, Company, BusinessType
from backend.AuditSerializerMixin import AuditSerializerMixin

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ["id", "name"]


class BusinessTypeSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)

    class Meta:
        model = BusinessType
        fields = ["id", "name", "short_name", "company"]


class FactorySerializer(AuditSerializerMixin, serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    company_id = serializers.PrimaryKeyRelatedField(
        queryset=Company.objects.all(),
        source="company",
        write_only=True
    )

    business_type = BusinessTypeSerializer(read_only=True)
    business_type_id = serializers.PrimaryKeyRelatedField(
        queryset=BusinessType.objects.all(),
        source="business_type",
        write_only=True
    )

    class Meta:
        model = Factory
        fields = [
            "id",
            "name",
            "address",
            "short_name",
            "company", "company_id",
            "business_type", "business_type_id",
        ]
