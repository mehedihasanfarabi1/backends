from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q

from products.models.product import Product
from products.serializers.productSerializer import ProductSerializer, BulkProductSerializer
from users.models import UserPermissionSet
from products.permissions import ModulePermission

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

                allowed_bts = p.business_types.get(str(company_id), [])
                if allowed_bts:
                    bt_filter = Q()
                    for bt_id in allowed_bts:
                        bt_filter |= Q(business_type_id=bt_id)
                    company_filter &= bt_filter

                allowed_factories = p.factories.get(str(company_id), [])
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

        return Product.objects.none()

    # ✅ Bulk Create endpoint
    # ✅ Bulk create
    @action(detail=False, methods=["post"], url_path="bulk-create")
    def bulk_create(self, request):
        data = request.data.get("products", [])
        if not data:
            return Response({"detail": "No products provided."}, status=status.HTTP_400_BAD_REQUEST)

        created = []
        errors = []

        for item in data:
            serializer = self.get_serializer(data=item)
            if serializer.is_valid():
                serializer.save()
                created.append(serializer.data)
            else:
                errors.append(serializer.errors)

        if errors:
            return Response({"created": created, "errors": errors}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"detail": f"{len(created)} products created successfully.", "data": created}, status=status.HTTP_201_CREATED)
