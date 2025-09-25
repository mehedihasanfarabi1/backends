from rest_framework.views import APIView
from rest_framework.response import Response
from booking.permissions import get_all_booking_permissions
from rest_framework.permissions import IsAuthenticated

class BookingPermissionListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        permissions = get_all_booking_permissions()  # সব booking permissions
        return Response(permissions)
