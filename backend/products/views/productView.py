# products/views/productViews.py
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from products.models.product import Product
from products.serializers.productSerializer import ProductSerializer
from products.permissions import ModulePermission
from users.models import UserPermissionSet


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated, ModulePermission]
    module_name = "product"

    def get_queryset(self):
        user = self.request.user
        qs = Product.objects.select_related(
            "company", "business_type", "factory", "product_type", "category"
        ).all()

        if user.is_superuser or user.is_staff:
            return qs

        perms = UserPermissionSet.objects.filter(user=user)
        query = Q()

        for p in perms:
            product_perm = p.product_module or {}
            module_perm = product_perm.get("product", {})
            if not module_perm.get("view", False):
                continue

            allowed_companies = list(map(int, p.companies or []))
            for company_id in allowed_companies:
                company_filter = Q(company_id=company_id)

                # Business Types
                allowed_bts = getattr(p, "business_types", {}).get(str(company_id), [])
                if allowed_bts:
                    bt_filter = Q()
                    for bt_id in allowed_bts:
                        bt_filter |= Q(business_type_id=bt_id)
                    company_filter &= bt_filter

                # Factories
                allowed_factories = getattr(p, "factories", {}).get(str(company_id), [])
                if allowed_factories:
                    factory_filter = Q()
                    for f in allowed_factories:
                        factory_id = f.get("factory_id")
                        bt_id = f.get("business_type_id")
                        if bt_id:
                            factory_filter |= Q(factory_id=factory_id, business_type_id=bt_id)
                        else:
                            factory_filter |= Q(factory_id=factory_id)
                    company_filter &= factory_filter

                # Product Types (optional)
                allowed_product_types = getattr(p, "product_types", {}).get(str(company_id), [])
                if allowed_product_types:
                    pt_filter = Q()
                    for pt_id in allowed_product_types:
                        pt_filter |= Q(product_type_id=pt_id)
                    company_filter &= pt_filter

                # Categories (optional)
                allowed_categories = getattr(p, "categories", {}).get(str(company_id), [])
                if allowed_categories:
                    cat_filter = Q()
                    for cat_id in allowed_categories:
                        cat_filter |= Q(category_id=cat_id)
                    company_filter &= cat_filter

                query |= company_filter

        if query:
            return qs.filter(query).distinct()

        return Product.objects.none()

    def get_permissions(self):
        action_perm_map = {
            "list": "product_view",
            "retrieve": "product_view",
            "create": "product_create",
            "update": "product_edit",
            "partial_update": "product_edit",
            "destroy": "product_delete",
        }
        self.permission_code = action_perm_map.get(self.action)
        return super().get_permissions()
