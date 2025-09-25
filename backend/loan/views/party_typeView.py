from rest_framework import viewsets
from party_type.models.party_type import PartyType
from party_type.serializers.party_typeSerializers import PartyTypeSerializer
from rest_framework.permissions import IsAuthenticated
from party_type.permissions import PartyTypeModulePermission
from users.models import UserPermissionSet
from django.db.models import Q

class PartyTypeViewSet(viewsets.ModelViewSet):
    queryset = PartyType.objects.all()
    serializer_class = PartyTypeSerializer
    permission_classes = [IsAuthenticated, PartyTypeModulePermission]
    module_name = "party_type"

    def get_queryset(self):
        user = self.request.user
        qs = PartyType.objects.all()

        # 🔹 filter by company_id if query param given
        company_id = self.request.query_params.get("company_id")
        if company_id:
            qs = qs.filter(company_id=company_id)

        if user.is_superuser or user.is_staff:
            return qs

        perms = UserPermissionSet.objects.filter(user=user)
        allowed_company_ids = set()
        for p in perms:
            party_perm = p.party_type_module
            if isinstance(party_perm, str):
                import json
                try:
                    party_perm = json.loads(party_perm)
                except:
                    party_perm = {}
            elif party_perm is None:
                party_perm = {}

            module_perm = party_perm.get("party_type", {})
            if module_perm.get("view", False) or module_perm.get("edit", False):
                for cid in p.companies or []:
                    allowed_company_ids.add(cid)

        if not allowed_company_ids:
            return PartyType.objects.none()

        return qs.filter(company_id__in=allowed_company_ids).distinct()
