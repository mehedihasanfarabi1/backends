from django.db import models
from datetime import datetime
from backend.mixins import AuditMixin


class BagType(AuditMixin, models.Model):

    session = models.IntegerField(
        choices=[(year, str(year)) for year in range(2020, 2035)],
        default=datetime.now().year
    )

    name = models.CharField(max_length=255)

    per_bag_rent = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    per_kg_rent = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    agent_bag_rent = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    agent_kg_rent = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    party_bag_rent = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    party_kg_rent = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    per_bag_loan = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    empty_bag_rate = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    fan_charge = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    is_default = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    def __str__(self):
        return f"{self.session} - {self.name}"
