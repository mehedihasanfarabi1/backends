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



class NextSRNoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        last_no = SR.objects.aggregate(Max("sr_no"))["sr_no__max"] or 0
        next_no = last_no + 1
        return Response({"next_sr_no": next_no})
