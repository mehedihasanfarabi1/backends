# accounts/serializers.py
from rest_framework import serializers
from accounts.models.accountsHead import AccountHead
from backend.AuditSerializerMixin import AuditSerializerMixin

class AccountHeadSerializer(AuditSerializerMixin, serializers.ModelSerializer):
    class Meta:
        model = AccountHead
        fields = ["id", "head_name", "debit", "credit", "balance", "created_at", "updated_at"]
        read_only_fields = ["balance", "created_at", "updated_at"]
