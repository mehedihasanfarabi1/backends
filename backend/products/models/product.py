# products/models/product.py
from django.db import models
from backend.mixins import AuditMixin
from company.models import Company
from .productType import ProductType
from .category import Category


class Product(AuditMixin):
    company = models.ForeignKey(
        "company.Company",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="%(class)s_company",
        default=""
    )
    business_type = models.ForeignKey(
        "company.BusinessType",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="%(class)s_business_type",
        default=""
    )
    factory = models.ForeignKey(
        "company.Factory",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="%(class)s_factory",
        default=""
    )
    product_type = models.ForeignKey(
        ProductType,
        on_delete=models.SET_NULL,
        related_name="products",
        null=True,
        blank=True
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        related_name="products",
        null=True,
        blank=True
    )
    name = models.CharField(max_length=200)
    short_name = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return self.name

