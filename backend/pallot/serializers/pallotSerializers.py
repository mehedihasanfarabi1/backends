from rest_framework import serializers
from pallot.models.pallot import Pallot
from pallot.models.pallotType import PallotType
from pallot.models.pallotLocation import Chamber, Floor, Pocket
from sr.models.sr import SR
from backend.AuditSerializerMixin import AuditSerializerMixin


class SRSerializer(serializers.ModelSerializer):
    class Meta:
        model = SR
        fields = ["id", "sr_no", "submitted_bag_quantity"]


class PallotTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PallotType
        fields = ["id", "name"]


class ChamberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chamber
        fields = ["id", "name"]


class FloorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Floor
        fields = ["id", "name"]


class PocketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pocket
        fields = ["id", "name"]


class PallotSerializer(AuditSerializerMixin, serializers.ModelSerializer):
    pallot_type = PallotTypeSerializer(read_only=True)
    sr = SRSerializer(read_only=True)
    chamber = ChamberSerializer(read_only=True)
    floor = FloorSerializer(read_only=True)
    pocket = PocketSerializer(read_only=True)

    # 👉 Writable ফিল্ড
    pallot_type_id = serializers.PrimaryKeyRelatedField(
        queryset=PallotType.objects.all(), source="pallot_type", write_only=True, required=False
    )
    sr_id = serializers.PrimaryKeyRelatedField(
        queryset=SR.objects.all(), source="sr", write_only=True, required=False, allow_null=True
    )
    chamber_id = serializers.PrimaryKeyRelatedField(
        queryset=Chamber.objects.all(), source="chamber", write_only=True, required=False, allow_null=True
    )
    floor_id = serializers.PrimaryKeyRelatedField(
        queryset=Floor.objects.all(), source="floor", write_only=True, required=False, allow_null=True
    )
    pocket_id = serializers.PrimaryKeyRelatedField(
        queryset=Pocket.objects.all(), source="pocket", write_only=True, required=False, allow_null=True
    )

    class Meta:
        model = Pallot
        fields = [
            "id",
            "pallot_type", "pallot_type_id",
            "date",
            "pallot_number",
            "sr", "sr_id",
            "sr_quantity",
            "comment",
            "chamber", "chamber_id",
            "floor", "floor_id",
            "pocket", "pocket_id",
            "quantity",
        ]

