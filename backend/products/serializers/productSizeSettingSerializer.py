# products/serializers/productSizeSettingSerializer.py
from rest_framework import serializers
from products.models.productSizeSetting import ProductSizeSetting
from products.models.product import Product
from products.models.unit import Unit
from products.models.unitSize import UnitSize
from company.models.company import Company
from company.models.business_type import BusinessType
from company.models.factory import Factory
from products.models.category import Category

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ["id", "name"]

class UnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unit
        fields = ["id", "name", "short_name"]

class UnitSizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = UnitSize
        fields = ["id", "size_name"]

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
    class Meta:
        model = Category
        fields = ["id", "name"]

class ProductSizeSettingSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), source="product", write_only=True
    )

    unit = UnitSerializer(read_only=True)
    unit_id = serializers.PrimaryKeyRelatedField(
        queryset=Unit.objects.all(), source="unit", write_only=True
    )

    size = UnitSizeSerializer(read_only=True)
    size_id = serializers.PrimaryKeyRelatedField(
        queryset=UnitSize.objects.all(), source="size", write_only=True
    )

    company = CompanySerializer(read_only=True)
    company_id = serializers.PrimaryKeyRelatedField(
        queryset=Company.objects.all(), source="company", write_only=True, required=False, allow_null=True
    )

    business_type = BusinessTypeSerializer(read_only=True)
    business_type_id = serializers.PrimaryKeyRelatedField(
        queryset=BusinessType.objects.all(), source="business_type", write_only=True, required=False, allow_null=True
    )

    factory = FactorySerializer(read_only=True)
    factory_id = serializers.PrimaryKeyRelatedField(
        queryset=Factory.objects.all(), source="factory", write_only=True, required=False, allow_null=True
    )

    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source="category", write_only=True, required=False, allow_null=True
    )

    class Meta:
        model = ProductSizeSetting
        fields = [
            "id",
            "company", "company_id",
            "business_type", "business_type_id",
            "factory", "factory_id",
            "category", "category_id",
            "product", "product_id",
            "unit", "unit_id",
            "size", "size_id",
            "customize_name",
            "code",
        ]
