# ====================
# products/views/productTypeViews.py (Debug Final)
# ====================
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from products.models.productType import ProductType
from products.serializers.productTypeSerializer import ProductTypeSerializer
from users.models import UserPermissionSet
from django.db.models import Q
from rest_framework.exceptions import PermissionDenied
from products.permissions import ModulePermission


class ProductTypeViewSet(viewsets.ModelViewSet):
    serializer_class = ProductTypeSerializer
    permission_classes = [IsAuthenticated, ModulePermission]
    module_name = "product_type"

    def get_queryset(self):
        user = self.request.user
        qs = ProductType.objects.select_related("company", "business_type", "factory").all()
        # print("DEBUG: Base QS count:", qs.count())
        # ✅ Filter by company query param if provided
        company_id = self.request.query_params.get("company")
        if company_id:
            qs = qs.filter(company_id=company_id)
            
        if user.is_superuser or user.is_staff:
            # print("DEBUG: Superuser/Staff detected, returning full QS")
            return qs

        perms = UserPermissionSet.objects.filter(user=user)
        # print("DEBUG: User PermissionSets found:", perms.count())

        query = Q()
        for p in perms:
            product_perm = p.product_module or {}
            # print("DEBUG: PermissionSet ID:", p.id, "Product Module Perm:", product_perm)

            # Check if product_type view allowed
            module_perm = product_perm.get("product_type", {})
            if not module_perm.get("view", False):
                # print("DEBUG: Skipping PermissionSet", p.id, "no view access")
                continue

            allowed_companies = list(map(int, p.companies or []))
            # print("DEBUG: Allowed Companies for set", p.id, ":", allowed_companies)

            for company_id in allowed_companies:
                company_filter = Q(company_id=company_id)

                allowed_bts = p.business_types.get(str(company_id), [])
                if allowed_bts:
                    bt_filter = Q()
                    for bt_id in allowed_bts:
                        bt_filter |= Q(business_type_id=bt_id)
                    company_filter &= bt_filter
                    # print("DEBUG: Company", company_id, "Allowed BTs:", allowed_bts)

                allowed_factories = p.factories.get(str(company_id), [])
                if allowed_factories:
                    factory_filter = Q()
                    for f in allowed_factories:
                        factory_filter |= Q(
                            factory_id=f["factory_id"],
                            business_type_id=f.get("business_type_id"),
                        )
                    company_filter &= factory_filter
                    # print("DEBUG: Company", company_id, "Allowed Factories:", allowed_factories)

                query |= company_filter 

        if query:
            final_qs = qs.filter(query).distinct()
            print("DEBUG: Final QS count after filter:", final_qs.count())
            return final_qs

        print("DEBUG: No matching permissions, returning empty QS")
        return ProductType.objects.none()
