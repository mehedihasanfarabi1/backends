# party_type/serializers/party_typeSerializers.py
from rest_framework import serializers
from party_type.models.party_type import PartyType
from company.models import Company

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ["id", "name"]

class PartyTypeSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    company_id = serializers.PrimaryKeyRelatedField(
        queryset=Company.objects.all(),
        source="company",
        write_only=True
    )

    class Meta:
        model = PartyType
        fields = "__all__"

    def create(self, validated_data):
        request = self.context['request']
        user = request.user
        validated_data['created_by'] = user
        validated_data['modified_by'] = user
        validated_data['ip_address'] = self.get_client_ip(request)
        validated_data['browser_info'] = self.get_browser_info(request)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        request = self.context['request']
        user = request.user
        validated_data['modified_by'] = user
        validated_data['ip_address'] = self.get_client_ip(request)
        validated_data['browser_info'] = self.get_browser_info(request)
        return super().update(instance, validated_data)

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

    def get_browser_info(self, request):
        return request.META.get('HTTP_USER_AGENT', '')
