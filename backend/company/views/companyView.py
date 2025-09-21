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

# ----------------- Company -----------------
# ----------------- Company -----------------
class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()   # ✅ Add this line
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated, CompanyModulePermission]
    module_name = "company"

    def get_queryset(self):
        user = self.request.user
        qs = Company.objects.all()
        if user.is_superuser or user.is_staff:
            return qs

        perms = UserPermissionSet.objects.filter(user=user)
        query = Q()
        for p in perms:
            company_perm = p.company_module or {}
            module_perm = company_perm.get("company", {})
            if not module_perm.get("view", False):
                continue
            for company_id in p.companies or []:
                query |= Q(id=company_id)

        if query:
            return qs.filter(query).distinct()
        return Company.objects.none()


class CompanyDetailsView(APIView):
    permission_classes = [IsAuthenticated, CompanyModulePermission]  # ✅ permission যোগ করা
    module_name = "company"  # ✅ module_name দিতে হবে

    def get(self, request, company_id):
        user = request.user

        # যদি superuser বা staff হয়
        if user.is_superuser or user.is_staff:
            business_types = BusinessType.objects.filter(company_id=company_id)
            factories = Factory.objects.filter(company_id=company_id)
        else:
            # user permission অনুযায়ী filter
            perms = UserPermissionSet.objects.filter(user=user, companies__contains=[company_id])
            
            bt_ids = []
            f_ids = []
            for p in perms:
                if p.business_types and str(company_id) in p.business_types:
                    bt_ids.extend(p.business_types[str(company_id)])
                if p.factories and str(company_id) in p.factories:
                    f_ids.extend([f.get("factory_id") for f in p.factories[str(company_id)]])

            # Filter করা business types
            business_types = BusinessType.objects.filter(company_id=company_id)
            if bt_ids:
                business_types = business_types.filter(id__in=bt_ids)

            # Filter করা factories
            factories = Factory.objects.filter(company_id=company_id)
            if f_ids:
                factories = factories.filter(id__in=f_ids)

        return Response({
            "business_types": BusinessTypeSerializer(business_types, many=True).data,
            "factories": FactorySerializer(factories, many=True).data
        })