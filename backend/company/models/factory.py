from django.db import models
from company.models.company import Company
from company.models.business_type import BusinessType
from backend.mixins import AuditMixin


class Factory(AuditMixin):
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        null=True, blank=True,
        related_name="factories"
    )
    business_type = models.ForeignKey(
        BusinessType,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="factories"
    )
    name = models.CharField(max_length=200)
    short_name = models.CharField(max_length=50, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ("company", "name")
        ordering = ["name"]

    def __str__(self):
        return self.name
