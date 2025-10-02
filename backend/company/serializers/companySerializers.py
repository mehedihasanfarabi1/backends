from rest_framework import serializers
from company.models import Company

from backend.AuditSerializerMixin import AuditSerializerMixin


class CompanySerializer(AuditSerializerMixin, serializers.ModelSerializer):
    class Meta:
        model = Company
        fields =["id", "name", "phone","code","email","address","website","telephone","description","proprietor_name"]
