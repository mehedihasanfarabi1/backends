from rest_framework import serializers
from backend.AuditSerializerMixin import AuditSerializerMixin
from party_type.models.party import Party
from products.models.productType import ProductType
from sr.models.sr import SR


class PartyMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Party
        fields = ["id", "name", "code"]


class ProductTypeMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductType
        fields = ["id", "name"]

class SRSerializer(AuditSerializerMixin, serializers.ModelSerializer):
    party = PartyMiniSerializer(read_only=True)
    party_id = serializers.PrimaryKeyRelatedField(
        queryset=Party.objects.all(),
        source="party",
        write_only=True
    )

    product_type = ProductTypeMiniSerializer(read_only=True)
    product_type_id = serializers.PrimaryKeyRelatedField(
        queryset=ProductType.objects.all(),
        source="product_type",
        write_only=True
    )

    class Meta:
        model = SR
        fields = "__all__"

