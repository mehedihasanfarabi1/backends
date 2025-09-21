from rest_framework import serializers
from products.models.productSizeSetting import ProductSizeSetting
from products.models.product import Product
from products.models.unit import Unit

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ["id", "name"]

class UnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unit
        fields = ["id", "name", "short_name"]

class ProductSizeSettingSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), source="product", write_only=True
    )

    unit = UnitSerializer(read_only=True)
    unit_id = serializers.PrimaryKeyRelatedField(
        queryset=Unit.objects.all(), source="unit", write_only=True
    )

    class Meta:
        model = ProductSizeSetting
        fields = ["id", "product", "product_id", "unit", "unit_id", "size", "short_name"]
