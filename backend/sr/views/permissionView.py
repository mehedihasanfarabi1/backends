from rest_framework.views import APIView
from rest_framework.response import Response
from sr.permissions import get_all_sr_permissions
from rest_framework.permissions import IsAuthenticated

class SRPermissionListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        permissions = get_all_sr_permissions()  # সব SR permissions
        return Response(permissions)
