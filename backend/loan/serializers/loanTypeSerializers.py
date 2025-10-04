from rest_framework import serializers
from backend.AuditSerializerMixin import AuditSerializerMixin
from loan.models.loanType import LoanType
from company.models.factory import Factory
from accounts.models.accountsHead import AccountHead

# Factory Serializer
class FactorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Factory
        fields = ["id", "name", "short_name"]

# Account Head Serializer
class AccountHeadSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccountHead
        fields = ["id", "name", "code"]

# LoanType Serializer
class LoanTypeSerializer(AuditSerializerMixin, serializers.ModelSerializer):
    branch = FactorySerializer(read_only=True)  # Nested Factory data
    branch_id = serializers.PrimaryKeyRelatedField(
        queryset=Factory.objects.all(), source="branch", write_only=True
    )

    head = AccountHeadSerializer(read_only=True)  # Nested AccountHead data
    head_id = serializers.PrimaryKeyRelatedField(
        queryset=AccountHead.objects.all(), source="head", write_only=True
    )

    class Meta:
        model = LoanType
        fields = [
            "id",
            "name",
            "has_interest",
            "interest_rate",
            "interest_start_date",
            "interest_end_date",
            "is_default",
            "_key",
            "session",
            "branch",
            "branch_id",
            "head",
            "head_id",
        ]
