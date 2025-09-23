from rest_framework import serializers
from .models import Translation


class TranslationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Translation
        fields = [
            "id",
            "key",
            "english",
            "bangla",
            "created_at",
            "modified_at",
            "created_by",
            "modified_by",
        ]
