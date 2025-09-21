from django.db import models
from backend.mixins import AuditMixin
from .product import Product
from .unit import Unit
from .unitSize import UnitSize

class ProductSizeSetting(AuditMixin):
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
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="size_settings")
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE)
    size = models.ForeignKey(UnitSize, on_delete=models.SET_NULL, null=True, blank=True)
    customize_name = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"{self.product.name} - {self.unit.short_name} ({self.customize_name or self.size})"
