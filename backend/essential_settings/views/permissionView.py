from rest_framework.views import APIView
from rest_framework.response import Response
from essential_settings.permissions import get_all_settings_permissions
from rest_framework.permissions import IsAuthenticated

class SettingsPermissionListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        permissions = get_all_settings_permissions()  # সব settings permissions
        return Response(permissions)
