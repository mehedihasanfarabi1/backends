from rest_framework import viewsets
from party_type.models.party import Party
from party_type.serializers.partySerializers import PartySerializer
from rest_framework.permissions import IsAuthenticated
from party_type.permissions import PartyTypeModulePermission
from users.models import UserPermissionSet
from django.db.models import Q

class PartyViewSet(viewsets.ModelViewSet):
    queryset = Party.objects.all().order_by("code")
    serializer_class = PartySerializer
    permission_classes = [IsAuthenticated, PartyTypeModulePermission]
    module_name = "party"

    def get_queryset(self):
        user = self.request.user
        qs = Party.objects.all().order_by("code")
        if user.is_superuser or user.is_staff:
            return qs

        perms = UserPermissionSet.objects.filter(user=user)
        query = Q()
        for p in perms:
            company_perm = p.company_module or {}
            module_perm = company_perm.get("party", {})
            if not module_perm.get("view", False):
                continue
            for company_id in p.companies or []:
                query |= Q(company_id=company_id)  # assuming Party has company foreign key

        if query:
            return qs.filter(query).distinct()
        return Party.objects.none()
