from rest_framework import serializers
from backend.AuditSerializerMixin import AuditSerializerMixin
from pallot.models.pallotType import PallotType
from company.models import Company

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ["id", "name"]  # শুধু id আর name লাগবে


class PallotTypeSerializer(AuditSerializerMixin, serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)  # nested company object
    company_id = serializers.PrimaryKeyRelatedField(
        queryset=Company.objects.all(),
        source="company",
        write_only=True
    )
    
    class Meta:
        model = PallotType
        fields = "__all__"
        