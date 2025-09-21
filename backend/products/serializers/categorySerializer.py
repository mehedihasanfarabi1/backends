from rest_framework import serializers
from products.models.category import Category
from products.models.productType import ProductType
from company.models import Company, BusinessType, Factory

class ProductTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductType
        fields = ["id", "name"]

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

class CategorySerializer(serializers.ModelSerializer):
    product_type = ProductTypeSerializer(read_only=True)
    product_type_id = serializers.PrimaryKeyRelatedField(
        queryset=ProductType.objects.all(),
        source="product_type",
        write_only=True
    )

    company = CompanySerializer(read_only=True)
    company_id = serializers.PrimaryKeyRelatedField(
        queryset=Company.objects.all(),
        source="company",
        write_only=True,
        required=False
    )

    business_type = BusinessTypeSerializer(read_only=True)
    business_type_id = serializers.PrimaryKeyRelatedField(
        queryset=BusinessType.objects.all(),
        source="business_type",
        write_only=True,
        required=False
    )

    factory = FactorySerializer(read_only=True)
    factory_id = serializers.PrimaryKeyRelatedField(
        queryset=Factory.objects.all(),
        source="factory",
        write_only=True,
        required=False
    )

    class Meta:
        model = Category
        fields = [
            "id", "name", "description",
            "company", "company_id",
            "business_type", "business_type_id",
            "factory", "factory_id",
            "product_type", "product_type_id"
        ]
