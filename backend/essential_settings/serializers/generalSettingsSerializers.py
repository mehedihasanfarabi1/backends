# backend/essential_settings/serializers/general_settings.py
from rest_framework import serializers
from essential_settings.models.generalSettings import GeneralSetting
from company.models.factory import Factory
from backend.AuditSerializerMixin import AuditSerializerMixin

class FactorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Factory
        fields = ["id", "name", "short_name"]


class GeneralSettingSerializer(AuditSerializerMixin,serializers.ModelSerializer):
    factory = FactorySerializer(read_only=True)
    factory_id = serializers.PrimaryKeyRelatedField(
        queryset=Factory.objects.all(), source="factory", write_only=True
    )

    class Meta:
        model = GeneralSetting
        fields = [
            "id", "factory", "factory_id", "author", "author_email", "author_phone",
            "author_mobile", "author_address", "title", "description", "address",
            "contact", "other_contacts", "tag", "loan_payment_form", "loan_receive_form",
            "delivery_form", "sendmail", "sendsms", "page_size", "currency", "theme",
            "language", "timezone", "favicon", "logo", "screen_saver", "key",
        ]
