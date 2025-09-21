from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Product
from .serializers import ProductSerializer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    @action(detail=False, methods=['get'])
    def by_lang(self, request):
        lang = request.GET.get('lang', 'en')
        products = self.get_queryset()
        serializer = ProductSerializer(products, many=True, context={'lang': lang})
        return Response(serializer.data)  # <-- এখানে list return হচ্ছে
