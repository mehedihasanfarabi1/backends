from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from booking.permissions import BookingModulePermission
from booking.serializers.bookingSerializers import BookingSerializer
from booking.models.booking import Booking
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import action
from rest_framework.response import Response
from utils.excel_import import import_excel_to_model

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated, BookingModulePermission]
    module_name = "booking"

    @action(detail=False, methods=["post"], url_path="bulk-import")
    def bulk_import(self, request):
        
        file = request.FILES.get("file")
        if not file:
            return Response({"error": "No file uploaded"}, status=400)
        print("DEBUG: FILES:", request.FILES)

        # Field mapping: Excel column → Model field
        field_mapping = {
            "name": "name",
            "desc": "desc",
        }

        print("FIle mapped : ",field_mapping)

        result = import_excel_to_model(file, Booking, field_mapping)

        if result["status"] == "success":
            return Response({"success": f"{result['count']} ProductTypes imported"}, status=201)
        else:
            return Response({"error": result["message"]}, status=400)   
    