# backend/essential_settings/serializers/transaction_settings.py
from rest_framework import serializers
from essential_settings.models.transactionSettings import TransactionSetting
from company.models.factory import Factory
from backend.AuditSerializerMixin import AuditSerializerMixin

class FactorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Factory
        fields = ["id", "name", "short_name"]


class TransactionSettingSerializer(AuditSerializerMixin,serializers.ModelSerializer):
    factory = FactorySerializer(read_only=True)
    factory_id = serializers.PrimaryKeyRelatedField(
        queryset=Factory.objects.all(), source="factory", write_only=True
    )

    class Meta:
        model = TransactionSetting
        fields = [
            "id", "factory", "factory_id", "session", "party_transaction",
            "advance_carrying_payment", "advance_carrying_receive",
            "advance_carrying_interest_receive", "advance_ebag_amount_receive",
            "advance_ebag_amount_interest_receive", "advance_loan_payment",
            "advance_loan_receive", "advance_loan_interest_receive",
            "sr_carrying_payment", "sr_carrying_receive", "sr_carrying_interest_receive",
            "sr_ebag_amount_payment", "sr_ebag_amount_receive",
            "sr_ebag_amount_interest_receive", "sr_loan_payment", "sr_loan_receive",
            "sr_loan_interest_receive", "delivery_transaction", "key",
        ]
