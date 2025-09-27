from rest_framework import serializers
from pallot.models.pallot import Pallot
from pallot.models.pallotType import PallotType
from sr.models.sr import SR
from backend.AuditSerializerMixin import AuditSerializerMixin


class SRSerializer(serializers.ModelSerializer):
    class Meta:
        model = SR
        fields = "__all__"


class PallotTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PallotType
        fields = "__all__"

class PallotSerializer(AuditSerializerMixin,serializers.ModelSerializer):
    class Meta:
        model = Pallot
        fields = ['pallot_type', 'date', 'pallot_number', 'sr', 'sr_quantity', 'comment', 'chamber', 'floor', 'pocket', 'quantity']

# serializers.py
# from rest_framework import serializers
# from pallot.models.pallot import Pallot
# from pallot.models.pallotLocation import Chamber, Floor, Pocket

# class PallotItemSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Pallot
#         fields = ['chamber', 'floor', 'pocket', 'quantity']

# class PallotSerializer(serializers.ModelSerializer):
#     items = PallotItemSerializer(many=True, write_only=True)

#     class Meta:
#         model = Pallot
#         fields = ['pallot_type', 'date', 'pallot_number', 'sr', 'sr_quantity', 'comment', 'items']

#     def create(self, validated_data):
#         items_data = validated_data.pop('items', [])
#         pallot = Pallot.objects.create(**validated_data)
#         for item in items_data:
#             Pallot.objects.create(
#                 pallot_type=pallot.pallot_type,
#                 date=pallot.date,
#                 pallot_number=pallot.pallot_number,
#                 sr=pallot.sr,
#                 sr_quantity=pallot.sr_quantity,
#                 comment=pallot.comment,
#                 chamber=item['chamber'],
#                 floor=item['floor'],
#                 pocket=item['pocket'],
#                 quantity=item['quantity']
#             )
#         return pallot
