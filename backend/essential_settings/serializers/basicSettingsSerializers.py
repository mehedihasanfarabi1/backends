# backend/essential_settings/serializers/basic_settings.py
from rest_framework import serializers
from essential_settings.models.basicSettings import BasicSetting
from company.models.factory import Factory
from backend.AuditSerializerMixin import AuditSerializerMixin

class FactorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Factory
        fields = ["id", "name", "short_name"]


class BasicSettingSerializer(AuditSerializerMixin,serializers.ModelSerializer):
    factory = FactorySerializer(read_only=True)
    factory_id = serializers.PrimaryKeyRelatedField(
        queryset=Factory.objects.all(), source="factory", write_only=True
    )

    class Meta:
        model = BasicSetting
        fields = [
            "id", "factory", "factory_id", "session", "interest_rate", "period",
            "min_day", "empty_bag_price", "max_loan_per_qty", "max_rent_per_qty",
            "max_rent_per_kg", "fan_charge", "labour_charge", "labour_charge_per_kg",
            "agent_commission", "ebag_count", "carrying_count", "carrying_interest_rate",
            "interest_start_date", "transaction_date", "delivery_type", "less_weight",
            "delivery_commission_rate", "value_mode", "monthly_interest",
            "loantype_interest", "key",
        ]
