from rest_framework import serializers
from backend.AuditSerializerMixin import AuditSerializerMixin
from party_type.models.patry_commission import PartyCommission
from party_type.models.party_type import PartyType
from party_type.models.party import Party
from products.models.category import Category
from products.models.product import Product
from products.models.unit import Unit
from products.models.unitSize import UnitSize

class PartyTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PartyType
        fields = ["id", "name"]

class PartySerializer(serializers.ModelSerializer):
    class Meta:
        model = Party
        fields = ["id", "name","code"]

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name"]

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ["id", "name"]

class UnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unit
        fields = ["id", "name"]

class UnitSizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = UnitSize
        fields = ["id", "size_name", "uom_weight"]

class PartyCommissionSerializer(AuditSerializerMixin, serializers.ModelSerializer):
    party_type = PartyTypeSerializer(read_only=True)
    party = PartySerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    product = ProductSerializer(read_only=True)
    unit = UnitSerializer(read_only=True)
    unit_size = UnitSizeSerializer(read_only=True)

    class Meta:
        model = PartyCommission
        fields = [
            "id",
            "party_type",
            "party",
            "category",
            "product",
            "unit",
            "unit_size",
            "commission_percentage",
            "commission_amount",
        ]


class PartyCommissionCreateSerializer(AuditSerializerMixin,serializers.ModelSerializer):
    class Meta:
        model = PartyCommission
        fields = [
            "party_type",
            "party",
            "category",
            "product",
            "unit",
            "unit_size",
            "commission_percentage",
            "commission_amount",
        ]
