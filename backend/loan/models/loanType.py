from django.db import models
from backend.mixins import AuditMixin


class LoanType(AuditMixin):
    name = models.CharField(max_length=255, unique=True)  # required & unique
    has_interest = models.BooleanField(default=True)  # True=Yes, False=No
    interest_rate = models.DecimalField(max_digits=4, decimal_places=2, default=0.00,blank=True,null=True)  # 0.00–99.99
    interest_start_date = models.DateField(blank=True, null=True)
    interest_end_date = models.DateField(blank=True, null=True)

    def __str__(self):
        return self.name or "Unnamed Loan Type"
