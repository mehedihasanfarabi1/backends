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
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.response import Response

from utils.excel_import import import_excel_to_model

# ----------------- Factory -----------------
class FactoryViewSet(viewsets.ModelViewSet):
    queryset = Factory.objects.all()   # ✅ Add this line
    serializer_class = FactorySerializer
    permission_classes = [IsAuthenticated, CompanyModulePermission]
    module_name = "factory"

    def get_queryset(self):
        user = self.request.user
        qs = Factory.objects.select_related("company", "business_type").all()
        if user.is_superuser or user.is_staff:
            return qs

        perms = UserPermissionSet.objects.filter(user=user)
        query = Q()
        for p in perms:
            company_perm = p.company_module or {}
            module_perm = company_perm.get("factory", {})
            if not module_perm.get("view", False):
                continue

            for company_id in p.companies or []:
                allowed_factories = p.factories.get(str(company_id), [])
                if allowed_factories:
                    for f in allowed_factories:
                        query |= Q(company_id=company_id,
                                   id=f["factory_id"],
                                   business_type_id=f.get("business_type_id"))
                else:
                    query |= Q(company_id=company_id)

        if query:
            return qs.filter(query).distinct()
        return Factory.objects.none()

    @action(detail=False, methods=["post"], url_path="bulk-import")
    def bulk_import(self, request):

        file = request.FILES.get("file")

        if not file:
            return Response({"error": "No file uploaded"}, status=400)

        # Field mapping: Excel column → Model field
        field_mapping = {
            "name": "name",
            "short_name": "short_name",
            "address": "address",
            "company": "company_id",         
            "business_type": "business_type_id",         
            
        }

        print("FIle mapped : ",field_mapping)

        result = import_excel_to_model(file, Factory, field_mapping)

        if result["status"] == "success":
            return Response({"success": f"{result['count']} Factory imported"}, status=201)
        else:
            return Response({"error": result["message"]}, status=400)