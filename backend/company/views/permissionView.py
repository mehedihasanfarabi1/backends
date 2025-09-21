from rest_framework.views import APIView
from rest_framework.response import Response
from company.permissions import get_all_company_permissions
from rest_framework.permissions import IsAuthenticated

class CompanyPermissionListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        permissions = get_all_company_permissions()  # সব company permissions
        return Response(permissions)
