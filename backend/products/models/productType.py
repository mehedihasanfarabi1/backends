# products/models/product_type.py

from django.db import models
from backend.mixins import AuditMixin
from company.models import Company   # 👈 import Company
from company.models import BusinessType   # 👈 import Company
from company.models import Factory   # 👈 import Company


class ProductType(AuditMixin):
    company = models.ForeignKey(
        Company,
        on_delete=models.SET_NULL,   # company ডিলিট হলে null হয়ে যাবে
        related_name="product_types",
        null=True,                   # nullable
        blank=True,default=""                  # form এও optional
    )
    business_type = models.ForeignKey(BusinessType, on_delete=models.SET_NULL, null=True, blank=True, related_name="product_types",default="" )
    factory = models.ForeignKey(Factory, on_delete=models.SET_NULL, null=True, blank=True, related_name="product_types",default="" )
    name = models.CharField(max_length=200)
    desc = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.name} ({self.company.name if self.company else 'No Company'})"
