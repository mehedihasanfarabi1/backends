from rest_framework.views import APIView
from rest_framework.response import Response
from loan.permissions import get_all_loan_module_permissions
from rest_framework.permissions import IsAuthenticated

class LoanModulePermissionListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        permissions = get_all_loan_module_permissions()  # সব loan module permissions
        return Response(permissions)
