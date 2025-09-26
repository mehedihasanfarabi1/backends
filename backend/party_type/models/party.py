from django.db import models
from backend.mixins import AuditMixin
from company.models import Company
from booking.models.booking import Booking
from .party_type import PartyType

class Party(AuditMixin):
    
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="parties",default=None)
    party_type = models.ForeignKey(PartyType, on_delete=models.SET_NULL, null=True, blank=True, related_name="parties",default=None)
    booking = models.ForeignKey(Booking, on_delete=models.SET_NULL, null=True, blank=True, related_name="parties",default=None)
    
    code = models.PositiveIntegerField(unique=True, editable=True)  # auto increment, handled in save()
    name = models.CharField(max_length=255)
    father_name = models.CharField(max_length=255, blank=True, null=True)
    village = models.CharField(max_length=255, blank=True, null=True)
    post = models.CharField(max_length=255, blank=True, null=True)
    thana = models.CharField(max_length=255, blank=True, null=True)
    zila = models.CharField(max_length=255, blank=True, null=True)
    mobile = models.CharField(max_length=20, blank=True, null=True)
    nid = models.CharField(max_length=50, blank=True, null=True)

    is_default = models.BooleanField(default=False)
    session = models.CharField(max_length=100, blank=True, null=True)
    status = models.BooleanField(default=True)

    booking_bag = models.PositiveIntegerField(default=0)
    bag_weight = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_weight = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    per_bag_rent = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_rent = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    per_kg_rent = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_kg_rent = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    rent_receive = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    per_bag_commission = models.DecimalField(max_digits=5, decimal_places=2, default=0)  # percentage
    interest_start_date = models.DateField(blank=True, null=True)
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)  # percentage

    class Meta:
        ordering = ["code"]

    def __str__(self):
        return f"{self.name} ({self.code})"

    def save(self, *args, **kwargs):
        if not self.code:
            # ✅ এখন আর company wise না, পুরো Party টেবিল থেকে সর্বশেষ code আনবে
            last_code = Party.objects.aggregate(models.Max("code"))["code__max"] or 0
            self.code = last_code + 1
        super().save(*args, **kwargs)