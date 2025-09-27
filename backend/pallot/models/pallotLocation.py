from django.db import models
from backend.mixins import AuditMixin
from company.models import Company


class Chamber(AuditMixin):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="chambers")
    name = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.name} ({self.company.name})"


class Floor(AuditMixin):
    chamber = models.ForeignKey(Chamber, on_delete=models.CASCADE, related_name="floors")
    name = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.chamber.name} → {self.name}"


class Pocket(AuditMixin):
    chamber = models.ForeignKey(Chamber, on_delete=models.CASCADE, related_name="pockets")
    floor = models.ForeignKey(Floor, on_delete=models.CASCADE, related_name="pockets")
    name = models.CharField(max_length=50)
    capacity = models.PositiveIntegerField(default=0)
    class Meta:
        unique_together = ('floor', 'name')  # same floor এ duplicate pocket না হয়

    def __str__(self):
        return f"{self.chamber.name} - {self.floor.name} - {self.name} (Capacity: {self.capacity})"
