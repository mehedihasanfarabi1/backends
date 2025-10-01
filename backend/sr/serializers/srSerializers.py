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
        fields = [
            "id",
            "party",
            "party_id",
            "product_type",
            "product_type_id",
            "date",
            "sr_no",
            "customer_name",
            "father_name",
            "village",
            "post",
            "thana",
            "zila",
            "mobile",
            "nid",
            "bag_type",
            "lot_number",
            "submitted_bag_quantity",
            "bag_rent",
            "total_rent",
            "labour_charge",
            "grand_total",
        ]
        read_only_fields = [
            "created_at",
            "modified_at",
            "ip_address",
            "browser_info",
            "is_deleted",
            "deleted_at",
            "created_by",
            "modified_by",
            "deleted_by",
        ]