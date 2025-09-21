from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from products.models.unitSize import UnitSize
from products.serializers.unitSizeSerializer import UnitSizeSerializer
from products.permissions import ModulePermission
from users.models import UserPermissionSet

class UnitSizeViewSet(viewsets.ModelViewSet):
    serializer_class = UnitSizeSerializer
    permission_classes = [IsAuthenticated, ModulePermission]
    module_name = "unit_size"

    def get_queryset(self):
        user = self.request.user
        qs = UnitSize.objects.select_related("unit", "unit__company", "unit__business_type", "unit__factory").all()

        # 🔹 Query param filter (frontend se)
        company_id = self.request.query_params.get("company")
        business_type_id = self.request.query_params.get("business_type")
        factory_id = self.request.query_params.get("factory")

        if company_id:
            qs = qs.filter(unit__company_id=company_id)
        if business_type_id:
            qs = qs.filter(unit__business_type_id=business_type_id)
        if factory_id:
            qs = qs.filter(unit__factory_id=factory_id)

        # 🔹 Superuser / Staff get all
        if user.is_superuser or user.is_staff:
            return qs

        # 🔹 Permission based filter
        perms = UserPermissionSet.objects.filter(user=user)
        query = Q()
        has_perm = False

        for p in perms:
            unit_size_perm = p.product_module or {}
            module_perm = unit_size_perm.get("unit_size", {})
            if not module_perm.get("view", False):
                continue

            has_perm = True
            allowed_companies = list(map(int, p.companies or []))

            if not allowed_companies:
                query |= Q(unit__company__isnull=True)
                continue

            for cid in allowed_companies:
                company_filter = Q(unit__company_id=cid)

                allowed_bts = p.business_types.get(str(cid), [])
                if allowed_bts:
                    bt_filter = Q()
                    for bt in allowed_bts:
                        bt_filter |= Q(unit__business_type_id=bt)
                    company_filter &= (bt_filter | Q(unit__business_type__isnull=True))

                allowed_factories = p.factories.get(str(cid), [])
                if allowed_factories:
                    f_filter = Q()
                    for f in allowed_factories:
                        f_filter |= Q(
                            unit__factory_id=f["factory_id"],
                            unit__business_type_id=f.get("business_type_id"),
                        )
                    company_filter &= (f_filter | Q(unit__factory__isnull=True))

                query |= company_filter

        if query:
            return qs.filter(query).distinct()

        if has_perm:
            return qs.filter(
                Q(unit__company__isnull=True)
                | Q(unit__business_type__isnull=True)
                | Q(unit__factory__isnull=True)
            ).distinct()

        return UnitSize.objects.none()

    def get_permissions(self):
        action_perm_map = {
            "list": "unit_size_view",
            "retrieve": "unit_size_view",
            "create": "unit_size_create",
            "update": "unit_size_edit",
            "partial_update": "unit_size_edit",
            "destroy": "unit_size_delete",
        }
        self.permission_code = action_perm_map.get(self.action)
        return super().get_permissions()
