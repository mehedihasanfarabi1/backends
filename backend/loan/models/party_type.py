from django.db import models
from django.conf import settings
from backend.mixins import AuditMixin
from company.models.company import Company

class PartyType(AuditMixin):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="parties",default=None)
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True, null=True)
    
    
    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name
