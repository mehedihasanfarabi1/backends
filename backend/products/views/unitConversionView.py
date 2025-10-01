from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q

from products.models.unitConversion import UnitConversion
from products.serializers.unitConversionSerializer import UnitConversionSerializer
from products.permissions import ModulePermission
from users.models import UserPermissionSet
from rest_framework.decorators import action
from rest_framework.response import Response
from utils.excel_import import import_excel_to_model

class UnitConversionViewSet(viewsets.ModelViewSet):
    serializer_class = UnitConversionSerializer
    permission_classes = [IsAuthenticated, ModulePermission]
    module_name = "unit_conversion"

    def get_queryset(self):
        user = self.request.user
        qs = UnitConversion.objects.select_related(
            "parent_unit", "child_unit", "company", "business_type", "factory"
        ).all()

        # 🔹 Query param filter (frontend)
        company_id = self.request.query_params.get("company")
        business_type_id = self.request.query_params.get("business_type")
        factory_id = self.request.query_params.get("factory")

        if company_id:
            qs = qs.filter(company_id=company_id)
        if business_type_id:
            qs = qs.filter(business_type_id=business_type_id)
        if factory_id:
            qs = qs.filter(factory_id=factory_id)

        # 🔹 Superuser / staff
        if user.is_superuser or user.is_staff:
            return qs

        # 🔹 Permission based filter
        perms = UserPermissionSet.objects.filter(user=user)
        query = Q()
        for p in perms:
            perm_module = p.product_module or {}
            module_perm = perm_module.get("unit_conversion", {})
            if not module_perm.get("view", False):
                continue

            allowed_companies = list(map(int, p.companies or []))
            for cid in allowed_companies:
                company_filter = Q(company_id=cid)

                allowed_bts = p.business_types.get(str(cid), [])
                if allowed_bts:
                    bt_filter = Q()
                    for bt in allowed_bts:
                        bt_filter |= Q(business_type_id=bt)
                    company_filter &= bt_filter

                allowed_factories = p.factories.get(str(cid), [])
                if allowed_factories:
                    factory_filter = Q()
                    for f in allowed_factories:
                        factory_filter |= Q(
                            factory_id=f["factory_id"],
                            business_type_id=f.get("business_type_id"),
                        )
                    company_filter &= factory_filter

                query |= company_filter

        if query:
            return qs.filter(query).distinct()
        return UnitConversion.objects.none()

    def get_permissions(self):
        action_perm_map = {
            "list": "unit_conversion_view",
            "retrieve": "unit_conversion_view",
            "create": "unit_conversion_create",
            "update": "unit_conversion_edit",
            "partial_update": "unit_conversion_edit",
            "destroy": "unit_conversion_delete",
        }
        self.permission_code = action_perm_map.get(self.action)
        return super().get_permissions()

    @action(detail=False, methods=["post"], url_path="bulk-import")
    def bulk_import(self, request):

        file = request.FILES.get("file")
        print("DEBUG: FILES:", request.FILES)
        if not file:
            return Response({"error": "No file uploaded"}, status=400)
        print("DEBUG: FILES:", request.FILES)

        # Field mapping: Excel column → Model field
        field_mapping = {
            "parent_unit": "parent_unit_id",
            "child_unit": "child_unit_id",
            "qty": "qty",
          
        }

        print("FIle mapped : ",field_mapping)

        result = import_excel_to_model(file, UnitConversion, field_mapping)

        if result["status"] == "success":
            return Response({"success": f"{result['count']} Unit imported"}, status=201)
        else:
            return Response({"error": result["message"]}, status=400)   