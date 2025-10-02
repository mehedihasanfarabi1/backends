# company/views/companyViews.py
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from company.models.company import Company
from company.models.business_type import BusinessType
from company.models.factory import Factory
from company.serializers.companySerializers import CompanySerializer
from company.serializers.businessTypeSerializers import BusinessTypeSerializer
from company.serializers.factorySerializers import FactorySerializer
from company.permissions import CompanyModulePermission
from users.models import UserPermissionSet
from django.db.models import Q
from rest_framework.views import APIView
from django.core.exceptions import ValidationError
from rest_framework.decorators import action
from rest_framework.response import Response

from utils.excel_import import import_excel_to_model
# ----------------- Business Type -----------------
class BusinessTypeViewSet(viewsets.ModelViewSet):
    queryset = BusinessType.objects.select_related("company").all().order_by("name")
    serializer_class = BusinessTypeSerializer
    permission_classes = [IsAuthenticated, CompanyModulePermission]
    module_name = "business_type"

    def get_queryset(self):
        user = self.request.user
        qs = BusinessType.objects.select_related("company").all().order_by("name")

        # 👉 filter by company_id (from query param)
        company_id = self.request.query_params.get("company_id")
        if company_id:
            qs = qs.filter(company_id=company_id)

        # 👉 Superuser/staff হলে সব দেখতে পাবে
        if user.is_superuser or user.is_staff:
            return qs

        # 👉 Permission check
        perms = UserPermissionSet.objects.filter(user=user)
        allowed_bt_ids = []
        for p in perms:
            company_perm = p.company_module or {}
            module_perm = company_perm.get("business_type", {})
            if not module_perm.get("view", False):
                continue

            for company_id in p.companies or []:
                if p.business_types and str(company_id) in p.business_types:
                    allowed_bt_ids.extend(p.business_types[str(company_id)])
                else:
                    allowed_bt_ids.extend(
                        BusinessType.objects.filter(company_id=company_id).values_list("id", flat=True)
                    )

        return qs.filter(id__in=allowed_bt_ids).distinct()
    @action(detail=False, methods=["post"], url_path="bulk-import")
    def bulk_import(self, request):

        file = request.FILES.get("file")

        if not file:
            return Response({"error": "No file uploaded"}, status=400)

        # Field mapping: Excel column → Model field
        field_mapping = {
            "name": "name",
            "short_name": "short_name",
            "company": "company_id",         
            
        }

        print("FIle mapped : ",field_mapping)

        result = import_excel_to_model(file, BusinessType, field_mapping)

        if result["status"] == "success":
            return Response({"success": f"{result['count']} business type imported"}, status=201)
        else:
            return Response({"error": result["message"]}, status=400)
    def perform_destroy(self, instance):
        try:
            instance.delete(user=self.request.user)
        except ValidationError as e:
            raise ValidationError({"detail": e.messages})