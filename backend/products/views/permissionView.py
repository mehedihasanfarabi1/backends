from rest_framework.views import APIView
from rest_framework.response import Response
from products.permissions import get_all_module_permissions
from rest_framework.permissions import IsAuthenticated

class PermissionListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        permissions = get_all_module_permissions()  # সব product module permissions
        return Response(permissions)
