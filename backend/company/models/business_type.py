from django.db import models
from company.models.company import Company
from backend.mixins import AuditMixin


class BusinessType(AuditMixin):
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        null=True, blank=True,
        related_name="business_types"
    )
    name = models.CharField(max_length=200)
    short_name = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        unique_together = ("company", "name")
        ordering = ["name"]

    def __str__(self):
        return self.name
