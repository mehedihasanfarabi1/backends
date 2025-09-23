from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import Translation
from .serializers import TranslationSerializer


class TranslationViewSet(viewsets.ModelViewSet):
    queryset = Translation.objects.all().order_by('key')
    serializer_class = TranslationSerializer

    def perform_create(self, serializer):
        if self.request.user and self.request.user.is_authenticated:
            serializer.save(created_by=self.request.user, modified_by=self.request.user)
        else:
            serializer.save()

    def perform_update(self, serializer):
        if self.request.user and self.request.user.is_authenticated:
            serializer.save(modified_by=self.request.user)
        else:
            serializer.save()
