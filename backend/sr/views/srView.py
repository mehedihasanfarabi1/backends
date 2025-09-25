from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q, Max

from sr.models.sr import SR
from sr.serializers.srSerializers import SRSerializer
from party_type.permissions import PartyTypeModulePermission
from users.models import UserPermissionSet
from sr.permissions import SRModulePermission

class SRViewSet(viewsets.ModelViewSet):
    queryset = SR.objects.all().order_by("sr_no")
    serializer_class = SRSerializer
    permission_classes = [IsAuthenticated, SRModulePermission]
    module_name = "sr"

    def get_queryset(self):
        user = self.request.user
        qs = SR.objects.all().order_by("sr_no")

        if user.is_superuser or user.is_staff:
            return qs

        perms = UserPermissionSet.objects.filter(user=user)
        query = Q()
        for p in perms:
            company_perm = p.company_module or {}
            module_perm = company_perm.get("sr", {})
            if not module_perm.get("view", False):
                continue
            # agent (Party) er company diye filter
            for company_id in p.companies or []:
                query |= Q(party__company_id=company_id)  # ✅ party ব্যবহার হবে


        if query:
            return qs.filter(query).distinct()
        return SR.objects.none()


class NextSRNoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        last_no = SR.objects.aggregate(Max("sr_no"))["sr_no__max"] or 0
        next_no = last_no + 1
        return Response({"next_sr_no": next_no})
