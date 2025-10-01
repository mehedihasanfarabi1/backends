from rest_framework import viewsets
from party_type.models.party import Party
from party_type.serializers.partySerializers import PartySerializer
from rest_framework.permissions import IsAuthenticated
from party_type.permissions import PartyTypeModulePermission
from users.models import UserPermissionSet
from django.db.models import Q
from django.db import models
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.response import Response
from rest_framework.decorators import action
from utils.excel_import import import_excel_to_model
from rest_framework import status
from company.models import Company
from party_type.models.party_type import PartyType

class PartyViewSet(viewsets.ModelViewSet):
    queryset = Party.objects.all().order_by("code")
    serializer_class = PartySerializer
    permission_classes = [IsAuthenticated, PartyTypeModulePermission]
    module_name = "party"

    def get_queryset(self):
        user = self.request.user
        qs = Party.objects.all().order_by("code")
        if user.is_superuser or user.is_staff:
            return qs

        perms = UserPermissionSet.objects.filter(user=user)
        query = Q()
        for p in perms:
            company_perm = p.company_module or {}
            module_perm = company_perm.get("party", {})
            if not module_perm.get("view", False):
                continue
            for company_id in p.companies or []:
                query |= Q(company_id=company_id)  # assuming Party has company foreign key

        if query:
            return qs.filter(query).distinct()
        return Party.objects.none()

        # ✅ Bulk Import for Party
    @action(detail=False, methods=["post"], url_path="bulk-import")
    def bulk_import(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)

        # Excel column → Model field mapping
        field_mapping = {
            "name": "name",
            "father_name": "father_name",
            "village": "village",
            "post": "post",
            "thana": "thana",
            "zila": "zila",
            "mobile": "mobile",
            "nid": "nid",
            "company": "company_id",         # company lookup
            "party_type": "party_type_id",   # party_type lookup
            "code": "code",   
            "booking":"booking_id",
             "session":"session",
             "booking_bag":"booking_bag",
             "bag_weight":"bag_weight",
             "total_weight":"total_weight",
             "per_bag_rent":"per_bag_rent",
             "total_rent":"total_rent",
             "per_kg_rent":"per_kg_rent",
             "total_kg_rent":"total_kg_rent",
             "rent_receive":"rent_receive",
             "per_bag_commission":"per_bag_commission",
             "interest_start_date":"interest_start_date",
             "interest_rate":"interest_rate",
        }

        # ForeignKey lookup rules
        # FK_LOOKUP = {
        #     "company_id": (Company, "name"),
        #     "party_type_id": (PartyType, "name"),
        # }

        result = import_excel_to_model(file, Party, field_mapping)

        if result["status"] == "success":
            return Response({"success": f"{result['count']} Party imported"}, status=status.HTTP_201_CREATED)
        else:
            return Response({"error": result["message"]}, status=status.HTTP_400_BAD_REQUEST)
class NextPartyCodeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        last_code = Party.objects.aggregate(models.Max("code"))["code__max"] or 0
        next_code = last_code + 1
        return Response({"next_code": next_code})
