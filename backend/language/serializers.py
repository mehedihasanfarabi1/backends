from rest_framework import serializers
from .models import Product

class ProductSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price']

    def get_name(self, obj):
        lang = self.context.get('lang', 'en')
        return obj.safe_translation_getter('name', language_code=lang, any_language=True)

    def get_description(self, obj):
        lang = self.context.get('lang', 'en')
        return obj.safe_translation_getter('description', language_code=lang, any_language=True)
