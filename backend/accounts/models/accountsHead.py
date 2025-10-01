from django.db import models
from backend.mixins import AuditMixin  

class AccountHead(AuditMixin):
    head_name = models.CharField(max_length=255, unique=True)
    debit = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    credit = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    def save(self, *args, **kwargs):
        # Balance auto calculate = Debit - Credit
        self.balance = (self.debit or 0) - (self.credit or 0)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.head_name} (Balance: {self.balance})"
