from rest_framework import serializers
from backend.AuditSerializerMixin import AuditSerializerMixin
from party_type.models.party_type import PartyType
from party_type.models.party import Party
from company.models import Company

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ["id", "name"]  # শুধু id আর name লাগবে

class PartyTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PartyType
        fields = ['id', 'name', 'description']
class PartySerializer(AuditSerializerMixin, serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)  # nested company object
    company_id = serializers.PrimaryKeyRelatedField(
        queryset=Company.objects.all(),
        source="company",
        write_only=True
    )
    party_type = PartyTypeSerializer(read_only=True)  # nested party_type object
    party_type_id = serializers.PrimaryKeyRelatedField(
        queryset=PartyType.objects.all(),
        source="party_type",
        write_only=True,
        allow_null=True,
        required=False
    )
    
    class Meta:
        model = Party
        fields = "__all__"
        
        
    # class Meta:
    #     model = Party
    #     fields = ['id', 'company', 'party_type', 'code', 
    #               'name', 'father_name', 'village', 'post', 'thana', 'zila', 
    #               'mobile', 'nid', 'is_default', 'session', 'status', 'booking_bag', 
    #               'bag_weight', 'total_weight', 'per_bag_rent', 'total_rent', 'per_kg_rent', 
    #               'total_kg_rent', 'rent_receive', 'per_bag_commission', 'interest_start_date', 'interest_rate']