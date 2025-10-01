# products/views/productSizeSettingViews.py
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from products.models.productSizeSetting import ProductSizeSetting
from products.serializers.productSizeSettingSerializer import ProductSizeSettingSerializer
from products.permissions import ModulePermission
from users.models import UserPermissionSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from utils.excel_import import import_excel_to_model


class ProductSizeSettingViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSizeSettingSerializer
    permission_classes = [IsAuthenticated, ModulePermission]
    module_name = "product_size_setting"

    def get_queryset(self):
        user = self.request.user
        qs = ProductSizeSetting.objects.select_related(
            "company", "business_type", "factory", "category", "product", "unit", "size"
        ).all()

        if user.is_superuser or user.is_staff:
            return qs

        perms = UserPermissionSet.objects.filter(user=user)
        query = Q()
        for p in perms:
            size_perm = p.product_module or {}
            module_perm = size_perm.get("product_size_setting", {})
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
        return ProductSizeSetting.objects.none()

    def get_permissions(self):
        action_perm_map = {
            "list": "product_size_setting_view",
            "retrieve": "product_size_setting_view",
            "create": "product_size_setting_create",
            "update": "product_size_setting_edit",
            "partial_update": "product_size_setting_edit",
            "destroy": "product_size_setting_delete",
        }
        self.permission_code = action_perm_map.get(self.action)
        return super().get_permissions()


    # ✅ Bulk Import Excel
    @action(detail=False, methods=["post"], url_path="bulk-import")
    def bulk_import(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)

        # Excel column → Model field mapping
        field_mapping = {
            "category": "category_id",
            "product": "product_id",
            "unit": "unit_id",
            "size": "size_id",
            "customize_name": "customize_name",
            "code": "code",
        }

        result = import_excel_to_model(file, ProductSizeSetting, field_mapping)

        if result["status"] == "success":
            return Response(
                {"success": f"{result['count']} ProductSizeSetting imported"},
                status=status.HTTP_201_CREATED
            )
        else:
            return Response({"error": result["message"]}, status=status.HTTP_400_BAD_REQUEST)
