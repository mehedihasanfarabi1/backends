
from rest_framework import serializers

class AuditSerializerMixin(serializers.ModelSerializer):
    def create(self, validated_data):
        request = self.context['request']
        user = request.user
        validated_data['created_by'] = user
        validated_data['modified_by'] = user
        validated_data['ip_address'] = self.get_client_ip(request)
        validated_data['browser_info'] = self.get_browser_info(request)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        request = self.context['request']
        user = request.user
        validated_data['modified_by'] = user
        validated_data['ip_address'] = self.get_client_ip(request)
        validated_data['browser_info'] = self.get_browser_info(request)
        return super().update(instance, validated_data)

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR')

    def get_browser_info(self, request):
        return request.META.get('HTTP_USER_AGENT', '')
