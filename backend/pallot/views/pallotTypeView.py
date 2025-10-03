# pallot/views/pallotTypeView.py
from rest_framework import viewsets
from pallot.models.pallotType import PallotType
from pallot.serializers.pallotTypeSerializers import PallotTypeSerializer
from rest_framework.permissions import IsAuthenticated
from pallot.permissions import PallotModulePermission
from users.models import UserPermissionSet
from django.views.decorators.cache import cache_page

class PallotTypeViewSet(viewsets.ModelViewSet):
    queryset = PallotType.objects.all()
    serializer_class = PallotTypeSerializer
    permission_classes = [IsAuthenticated, PallotModulePermission]
    module_name = "pallot_type"
    
    def get_queryset(self):
        user = self.request.user
        qs = PallotType.objects.all()

        # Filter by query param company_id
        company_id = self.request.query_params.get("company_id")
        if company_id:
            qs = qs.filter(company_id=company_id)

        # Superuser or staff see all
        if user.is_superuser or user.is_staff:
            return qs

        # Normal users: filter by allowed companies
        perms = UserPermissionSet.objects.filter(user=user)
        allowed_company_ids = set()
        for p in perms:
            pallot_perm = p.pallot_module or {}
            if isinstance(pallot_perm, str):
                import json
                try:
                    pallot_perm = json.loads(pallot_perm)
                except:
                    pallot_perm = {}

            module_perm = pallot_perm.get("pallot_type", {})
            if module_perm.get("view", False) or module_perm.get("edit", False):
                for cid in p.companies or []:
                    allowed_company_ids.add(cid)

        if not allowed_company_ids:
            return PallotType.objects.none()

        return qs.filter(company_id__in=allowed_company_ids).distinct()
