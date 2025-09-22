from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from rest_framework.response import Response
from rest_framework.decorators import action
from products.models.category import Category
from products.serializers.categorySerializer import CategorySerializer
from users.models import UserPermissionSet
from products.permissions import ModulePermission


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated, ModulePermission]
    module_name = "category"

    def get_queryset(self):
        user = self.request.user
        qs = Category.objects.select_related("company", "business_type", "factory", "product_type").all()

        # ✅ filter by product_type from query param
        product_type_id = self.request.query_params.get("product_type")
        if product_type_id:
            qs = qs.filter(product_type_id=product_type_id)

        if user.is_superuser or user.is_staff:
            return qs

        perms = UserPermissionSet.objects.filter(user=user)
        query = Q()

        for p in perms:
            category_perm = p.product_module or {}
            module_perm = category_perm.get("category", {})
            if not module_perm.get("view", False):
                continue

            allowed_companies = list(map(int, p.companies or []))

            for company_id in allowed_companies:
                company_filter = Q(company_id=company_id)

                # Business Types allowed
                allowed_bts = p.business_types.get(str(company_id), [])
                if allowed_bts:
                    bt_filter = Q()
                    for bt_id in allowed_bts:
                        bt_filter |= Q(business_type_id=bt_id)
                    company_filter &= bt_filter

                # Factories allowed
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
            final_qs = qs.filter(query).distinct()
            print("DEBUG: Category final count after filtering:", final_qs.count())
            return final_qs

        print("DEBUG: No matching permissions, returning empty QS")
        return Category.objects.none()

    # ✅ Bulk create endpoint
    @action(detail=False, methods=["post"], url_path="bulk-create")
    def bulk_create(self, request):
        """
        Expected Payload:
        {
            "categories": [
                {
                    "name": "Fruit",
                    "description": "Raw Fruit",
                    "company_id": 1,
                    "business_type_id": 2,
                    "factory_id": 3,
                    "product_type_id": 4
                },
                ...
            ]
        }
        """
        data = request.data
        categories = data.get("categories", [])

        if not categories:
            return Response({"detail": "No categories provided."}, status=status.HTTP_400_BAD_REQUEST)

        created = []
        errors = []

        for cat in categories:
            serializer = self.get_serializer(data=cat)
            if serializer.is_valid():
                serializer.save()
                created.append(serializer.data)
            else:
                errors.append(serializer.errors)

        if errors:
            return Response({"created": created, "errors": errors}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            {"detail": f"{len(created)} categories created successfully.", "data": created},
            status=status.HTTP_201_CREATED,
        )
