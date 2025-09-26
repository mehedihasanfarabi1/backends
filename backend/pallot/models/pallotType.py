from django.db import models
from backend.mixins import AuditMixin
from company.models import Company


class PallotType(AuditMixin):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="pallot_types",default=None)
    name = models.CharField(max_length=255)   

    def __str__(self):
        return self.name