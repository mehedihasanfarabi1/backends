
from rest_framework import serializers
from party_type.models.party_type import PartyType
from company.models import Company

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ["id", "name"]  # শুধু id আর name লাগবে
class PartyTypeSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)  # nested company object
    company_id = serializers.PrimaryKeyRelatedField(
        queryset=Company.objects.all(),
        source="company",
        write_only=True
    )
    class Meta:
        model = PartyType
        fields = "__all__"
        