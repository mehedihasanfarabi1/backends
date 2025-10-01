# products/views/unitViews.py
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from products.models.unit import Unit
from products.serializers.unitSerializer import UnitSerializer
from products.permissions import ModulePermission
from users.models import UserPermissionSet
from rest_framework.response import Response
from rest_framework.decorators import action
from utils.excel_import import import_excel_to_model
class UnitViewSet(viewsets.ModelViewSet):
    serializer_class = UnitSerializer
    permission_classes = [IsAuthenticated, ModulePermission]
    module_name = "unit"

    def get_queryset(self):
        user = self.request.user
        qs = Unit.objects.select_related("company", "business_type", "factory").all()

        # ✅ query param filter (company, business_type, factory)
        company_id = self.request.query_params.get("company")
        business_type_id = self.request.query_params.get("business_type")
        factory_id = self.request.query_params.get("factory")

        if company_id:
            qs = qs.filter(company_id=company_id)
        if business_type_id:
            qs = qs.filter(business_type_id=business_type_id)
        if factory_id:
            qs = qs.filter(factory_id=factory_id)

        # ✅ Superuser & staff can see all
        if user.is_superuser or user.is_staff:
            return qs

        # ✅ Permission based filter
        perms = UserPermissionSet.objects.filter(user=user)
        query = Q()
        has_perm = False

        for p in perms:
            unit_perm = p.product_module or {}
            module_perm = unit_perm.get("unit", {})
            if not module_perm.get("view", False):
                continue

            has_perm = True
            allowed_companies = list(map(int, p.companies or []))

            if not allowed_companies:
                query |= Q(company__isnull=True)
                continue

            for cid in allowed_companies:
                company_filter = Q(company_id=cid)

                allowed_bts = p.business_types.get(str(cid), [])
                if allowed_bts:
                    bt_filter = Q()
                    for bt in allowed_bts:
                        bt_filter |= Q(business_type_id=bt)
                    company_filter &= (bt_filter | Q(business_type__isnull=True))

                allowed_factories = p.factories.get(str(cid), [])
                if allowed_factories:
                    f_filter = Q()
                    for f in allowed_factories:
                        f_filter |= Q(
                            factory_id=f["factory_id"],
                            business_type_id=f.get("business_type_id"),
                        )
                    company_filter &= (f_filter | Q(factory__isnull=True))

                query |= company_filter

        if query:
            return qs.filter(query).distinct()

        if has_perm:
            return qs.filter(
                Q(company__isnull=True)
                | Q(business_type__isnull=True)
                | Q(factory__isnull=True)
            ).distinct()

        return Unit.objects.none()

    def get_permissions(self):
        action_perm_map = {
            "list": "unit_view",
            "retrieve": "unit_view",
            "create": "unit_create",
            "update": "unit_edit",
            "partial_update": "unit_edit",
            "destroy": "unit_delete",
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
            "name": "name",
            "short_name": "short_name",
          
        }

        print("FIle mapped : ",field_mapping)

        result = import_excel_to_model(file, Unit, field_mapping)

        if result["status"] == "success":
            return Response({"success": f"{result['count']} Unit imported"}, status=201)
        else:
            return Response({"error": result["message"]}, status=400)