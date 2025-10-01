# company/views/companyViews.py
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q
from users.models import UserPermissionSet
from company.models.company import Company
from company.models.business_type import BusinessType
from company.models.factory import Factory
from company.serializers.companySerializers import CompanySerializer
from company.serializers.businessTypeSerializers import BusinessTypeSerializer
from company.serializers.factorySerializers import FactorySerializer
from company.permissions import CompanyModulePermission
from django.core.exceptions import ValidationError
# ----------------- Company -----------------
class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated, CompanyModulePermission]
    module_name = "company"

    def get_queryset(self):
        user = self.request.user
        qs = Company.objects.all().order_by("name")

        if user.is_superuser or user.is_staff:
            return qs

        perms = UserPermissionSet.objects.filter(user=user)
        allowed_company_ids = set()
        for p in perms:
            company_perm = p.company_module or {}
            module_perm = company_perm.get("company", {})
            if module_perm.get("view", False):
                allowed_company_ids.update(p.companies or [])

        return qs.filter(id__in=allowed_company_ids).distinct()


# ----------------- Company Details -----------------
class CompanyDetailsView(APIView):
    permission_classes = [IsAuthenticated, CompanyModulePermission]
    module_name = "company"

    def get(self, request, company_id):
        user = request.user

        if user.is_superuser or user.is_staff:
            business_types = BusinessType.objects.filter(company_id=company_id).order_by("name")
            factories = Factory.objects.filter(company_id=company_id).order_by("name")
        else:
            perms = UserPermissionSet.objects.filter(user=user)
            allowed_bt_ids = []
            allowed_factory_ids = []

            for p in perms:
                if company_id in (p.companies or []):
                    # Business Types
                    if p.business_types and str(company_id) in p.business_types:
                        allowed_bt_ids.extend(p.business_types[str(company_id)])
                    # Factories
                    if p.factories and str(company_id) in p.factories:
                        allowed_factory_ids.extend([f.get("factory_id") for f in p.factories[str(company_id)]])

            business_types = BusinessType.objects.filter(company_id=company_id)
            if allowed_bt_ids:
                business_types = business_types.filter(id__in=allowed_bt_ids)
            business_types = business_types.order_by("name")

            factories = Factory.objects.filter(company_id=company_id)
            if allowed_factory_ids:
                factories = factories.filter(id__in=allowed_factory_ids)
            factories = factories.order_by("name")

        return Response({
            "business_types": BusinessTypeSerializer(business_types, many=True).data,
            "factories": FactorySerializer(factories, many=True).data
        })

    def perform_destroy(self, instance):
        try:
            instance.delete(user=self.request.user)
        except ValidationError as e:
            raise ValidationError({"detail": e.messages})

