from rest_framework import serializers
from products.models.unit import Unit
from backend.AuditSerializerMixin import AuditSerializerMixin


class UnitSerializer(AuditSerializerMixin, serializers.ModelSerializer):
    company_id = serializers.IntegerField(required=False, allow_null=True)
    business_type_id = serializers.IntegerField(required=False, allow_null=True)
    factory_id = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = Unit
        fields = "__all__"

    def create(self, validated_data):
        # company_id, business_type_id, factory_id properly save
        return Unit.objects.create(**validated_data)

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
