from django.contrib import admin
from .models import Product
from parler.admin import TranslatableAdmin

@admin.register(Product)
class ProductAdmin(TranslatableAdmin):
    list_display = ('name', 'price')
