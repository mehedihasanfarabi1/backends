from django.db import models
from backend.mixins import AuditMixin
from .product import Product
from .unit import Unit
from .unitSize import UnitSize
from .category import Category

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
    category = models.ForeignKey(Category,on_delete=models.CASCADE,null=True,blank=True,default=None)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="size_settings",null=True,blank=True,default=None)
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE,null=True,blank=True,default=None)
    size = models.ForeignKey(UnitSize, on_delete=models.SET_NULL, null=True, blank=True,default=None)
    code = models.BigIntegerField(max_length=100,blank=True,null=True,unique=True)
    customize_name = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"{self.product.name} - {self.unit.short_name} ({self.customize_name or self.size})"
