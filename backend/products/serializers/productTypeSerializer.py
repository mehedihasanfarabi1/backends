from rest_framework import serializers
from products.models import ProductType
from company.models import Company, BusinessType, Factory

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ["id", "name"]

class BusinessTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusinessType
        fields = ["id", "name"]

class FactorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Factory
        fields = ["id", "name"]

class ProductTypeSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    business_type = BusinessTypeSerializer(read_only=True)
    factory = FactorySerializer(read_only=True)

    company_id = serializers.PrimaryKeyRelatedField(
        queryset=Company.objects.all(),
        source="company",
        write_only=True,
        allow_null=True,
        required=False
    )
    business_type_id = serializers.PrimaryKeyRelatedField(
        queryset=BusinessType.objects.all(),
        source="business_type",
        write_only=True,
        allow_null=True,
        required=False
    )
    factory_id = serializers.PrimaryKeyRelatedField(
        queryset=Factory.objects.all(),
        source="factory",
        write_only=True,
        allow_null=True,
        required=False
    )
    

    class Meta:
        model = ProductType
        fields = [
            "id",
            "name",
            "desc",
            "company",
            "company_id",
            "business_type",
            "business_type_id",
            "factory",
            "factory_id",
        ]

