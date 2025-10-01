from rest_framework.views import APIView
from rest_framework.response import Response
from accounts.permissions import get_all_account_permissions
from rest_framework.permissions import IsAuthenticated

class AccountPermissionListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        permissions = get_all_account_permissions()  # সব account permissions
        return Response(permissions)
