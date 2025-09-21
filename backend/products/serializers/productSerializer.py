from rest_framework import serializers
from products.models.product import Product
from company.models import Company, BusinessType, Factory
from products.models.productType import ProductType
from products.models.category import Category

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
    class Meta:
        model = ProductType
        fields = ["id", "name"]

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name"]

class ProductSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    company_id = serializers.PrimaryKeyRelatedField(
        queryset=Company.objects.all(),
        source="company",
        write_only=True,
        allow_null=True,
        required=False
    )

    business_type = BusinessTypeSerializer(read_only=True)
    business_type_id = serializers.PrimaryKeyRelatedField(
        queryset=BusinessType.objects.all(),
        source="business_type",
        write_only=True,
        allow_null=True,
        required=False
    )

    factory = FactorySerializer(read_only=True)
    factory_id = serializers.PrimaryKeyRelatedField(
        queryset=Factory.objects.all(),
        source="factory",
        write_only=True,
        allow_null=True,
        required=False
    )

    product_type = ProductTypeSerializer(read_only=True)
    product_type_id = serializers.PrimaryKeyRelatedField(
        queryset=ProductType.objects.all(),
        source="product_type",
        write_only=True,
        allow_null=True,
        required=False
    )

    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source="category",
        write_only=True,
        allow_null=True,
        required=False
    )

    class Meta:
        model = Product
        fields = "__all__"
