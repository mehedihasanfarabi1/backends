from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from booking.permissions import BookingModulePermission
from booking.serializers.bookingSerializers import BookingSerializer
from booking.models.booking import Booking
from rest_framework.authentication import TokenAuthentication

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated, BookingModulePermission]
    module_name = "booking"
    
    