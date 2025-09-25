from rest_framework import serializers
from company.models import BusinessType, Company
from backend.AuditSerializerMixin import AuditSerializerMixin

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ["id", "name"]  # শুধু id আর name লাগবে

class BusinessTypeSerializer(AuditSerializerMixin, serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)  # nested company object
    company_id = serializers.PrimaryKeyRelatedField(
        queryset=Company.objects.all(),
        source="company",
        write_only=True
    )

    class Meta:
        model = BusinessType
        fields = ["id", "name", "short_name", "company", "company_id"]

