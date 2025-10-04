from django.db import models
from backend.mixins import AuditMixin
from company.models.factory import Factory
from accounts.models.accountsHead import AccountHead

class LoanType(AuditMixin):
    session = models.PositiveIntegerField(blank=True, null=True)
    branch = models.ForeignKey(Factory, null=True, blank=True, on_delete=models.SET_NULL)
    head = models.ForeignKey(AccountHead, null=True, blank=True, on_delete=models.SET_NULL,default=None)
    name = models.CharField(max_length=255, unique=True)
    has_interest = models.BooleanField(default=True)  # maps interest_count Yes/No
    interest_rate = models.DecimalField(max_digits=4, decimal_places=2, default=0.00, blank=True, null=True)
    interest_start_date = models.DateField(blank=True, null=True)
    interest_end_date = models.DateField(blank=True, null=True)
    is_default = models.BooleanField(default=False)
    _key = models.CharField(max_length=32, blank=True, null=True)

    def __str__(self):
        return self.name or "Unnamed Loan Type"
