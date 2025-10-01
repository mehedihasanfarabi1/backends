from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q, Max
from rest_framework.decorators import action
from rest_framework.response import Response
from utils.excel_import import import_excel_to_model
from sr.models.sr import SR
from sr.serializers.srSerializers import SRSerializer
from party_type.permissions import PartyTypeModulePermission
from users.models import UserPermissionSet
from sr.permissions import SRModulePermission

class SRViewSet(viewsets.ModelViewSet):
    queryset = SR.objects.all().order_by("sr_no")
    serializer_class = SRSerializer
    permission_classes = [IsAuthenticated, SRModulePermission]
    module_name = "sr"

    @action(detail=False, methods=["post"], url_path="bulk-import")
    def bulk_import(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response({"error": "No file uploaded"}, status=400)

        # Excel column → Model field mapping
        field_mapping = {
            "party": "party_id",
            "product_type": "product_type_id",
            "date": "date",
            "sr_no": "sr_no",
            "customer_name": "customer_name",
            "father_name": "father_name",
            "village": "village",
            "post": "post",
            "thana": "thana",
            "zila": "zila",
            "mobile": "mobile",
            "nid": "nid",
            "bag_type": "bag_type",
            "lot_number": "lot_number",
            "submitted_bag_quantity": "submitted_bag_quantity",
            "bag_rent": "bag_rent",
            "total_rent": "total_rent",
            "labour_charge": "labour_charge",
            "grand_total": "grand_total",
        }

        result = import_excel_to_model(file, SR, field_mapping)

        if result["status"] == "success":
            return Response({"success": f"{result['count']} SR imported"}, status=201)
        else:
            return Response({"error": result["message"]}, status=400)

class NextSRNoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        last_no = SR.objects.aggregate(Max("sr_no"))["sr_no__max"] or 0
        next_no = last_no + 1
        return Response({"next_sr_no": next_no})
