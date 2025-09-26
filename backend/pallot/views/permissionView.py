from rest_framework.views import APIView
from rest_framework.response import Response
from pallot.permissions import get_all_pallot_permissions
from rest_framework.permissions import IsAuthenticated

class PallotPermissionListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        permissions = get_all_pallot_permissions()  # সব pallot permissions
        return Response(permissions)
