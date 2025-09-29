from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from loan.models.loanType import LoanType
from loan.serializers.loanTypeSerializers import LoanTypeSerializer
from loan.permissions import LoanModulePermission
from users.models import UserPermissionSet
import json


class LoanTypeViewSet(viewsets.ModelViewSet):
    queryset = LoanType.objects.all()
    serializer_class = LoanTypeSerializer
    permission_classes = [IsAuthenticated, LoanModulePermission]
    module_name = "loan_type"

    def get_queryset(self):
        user = self.request.user
        qs = LoanType.objects.all()

        if not user.is_authenticated:
            return LoanType.objects.none()

        if user.is_superuser or user.is_staff:
            return qs

        p = UserPermissionSet.objects.filter(user=user).first()
        if not p:
            return LoanType.objects.none()

        loan_perm = self._parse_permissions(p.loan_module)
        module_perm = loan_perm.get("loan_type", {})

        if module_perm.get("view", False):
            return qs

        return LoanType.objects.none()

    def _parse_permissions(self, raw_perm):
        if isinstance(raw_perm, str):
            try:
                return json.loads(raw_perm)
            except json.JSONDecodeError:
                return {}
        return raw_perm or {}
