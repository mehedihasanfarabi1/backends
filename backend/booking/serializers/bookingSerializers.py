# party_type/serializers/party_typeSerializers.py
from rest_framework import serializers

from booking.models.booking import Booking
from backend.AuditSerializerMixin import AuditSerializerMixin


class BookingSerializer(AuditSerializerMixin,serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = "__all__"
        
        
