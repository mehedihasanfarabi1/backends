# accounts/views.py
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from accounts.models.accountsHead import AccountHead
from accounts.serializers.accountsHeadSerializers import AccountHeadSerializer
from accounts.permissions import AccountHeadModulePermission

class AccountHeadViewSet(viewsets.ModelViewSet):
    queryset = AccountHead.objects.all().order_by("-created_at")
    serializer_class = AccountHeadSerializer
    permission_classes = [IsAuthenticated, AccountHeadModulePermission]
    module_name = "account_head"


