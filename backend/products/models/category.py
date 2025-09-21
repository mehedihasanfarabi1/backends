from django.db import models
from backend.mixins import AuditMixin
from products.models.productType import ProductType
from company.models import Company   # ✅ add company import


class Category(AuditMixin):
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
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)

    # ✅ relation to ProductType
    product_type = models.ForeignKey(
        ProductType,
        on_delete=models.CASCADE,
        related_name="categories",
        null=True,
        blank=True
    )

    def __str__(self):
        return f"{self.name} ({self.company.name if self.company else 'No Company'})"
