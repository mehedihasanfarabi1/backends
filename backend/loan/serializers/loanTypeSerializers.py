from rest_framework import serializers
from backend.AuditSerializerMixin import AuditSerializerMixin
from loan.models.loanType import LoanType

class LoanTypeSerializer(AuditSerializerMixin, serializers.ModelSerializer):
    class Meta:
        model = LoanType
        fields = [
            "id",
            "name",
            "has_interest",
            "interest_rate",
            "interest_start_date",
            "interest_end_date",
        ]