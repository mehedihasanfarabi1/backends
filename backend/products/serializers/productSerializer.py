from rest_framework import serializers
from products.models.product import Product
from company.models import Company, BusinessType, Factory
from products.models.productType import ProductType
from products.models.category import Category
from backend.AuditSerializerMixin import AuditSerializerMixin
class ProductTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductType
        fields = ["id", "name"]

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
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

class ProductSerializer(AuditSerializerMixin, serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    company_id = serializers.PrimaryKeyRelatedField(queryset=Company.objects.all(), source="company", write_only=True, required=False)

    business_type = BusinessTypeSerializer(read_only=True)
    business_type_id = serializers.PrimaryKeyRelatedField(queryset=BusinessType.objects.all(), source="business_type", write_only=True, required=False)

    factory = FactorySerializer(read_only=True)
    factory_id = serializers.PrimaryKeyRelatedField(queryset=Factory.objects.all(), source="factory", write_only=True, required=False)

    product_type = ProductTypeSerializer(read_only=True)
    product_type_id = serializers.PrimaryKeyRelatedField(queryset=ProductType.objects.all(), source="product_type", write_only=True)

    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), source="category", write_only=True, required=False)

    class Meta:
        model = Product
        fields = [
            "id", "name", "short_name",
            "company", "company_id",
            "business_type", "business_type_id",
            "factory", "factory_id",
            "product_type", "product_type_id",
            "category", "category_id"
        ]

# Bulk Serializer
class BulkProductCreateSerializer(serializers.ListSerializer):
    child = ProductSerializer()

    def create(self, validated_data):
        products = [ProductSerializer().create(item) for item in validated_data]
        return products

class BulkProductSerializer(ProductSerializer):
    class Meta(ProductSerializer.Meta):
        list_serializer_class = BulkProductCreateSerializer
