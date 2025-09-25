from rest_framework.views import APIView
from rest_framework.response import Response
from party_type.permissions import get_all_party_type_permissions
from rest_framework.permissions import IsAuthenticated

class PartyTypePermissionListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        permissions = get_all_party_type_permissions()  # সব company permissions
        return Response(permissions)
