from django.db import models
from backend.mixins import AuditMixin
from party_type.models.party import Party
from products.models.productType import ProductType


class SR(AuditMixin):
    date = models.DateField()
    sr_no = models.PositiveIntegerField(unique=True, editable=True) 
    party = models.ForeignKey(Party, on_delete=models.CASCADE, related_name="party_srs", default=None)
    customer_name = models.CharField(max_length=255)
    father_name = models.CharField(max_length=255, blank=True, null=True)
    village = models.CharField(max_length=255, blank=True, null=True)
    post = models.CharField(max_length=255, blank=True, null=True)
    thana = models.CharField(max_length=255, blank=True, null=True)
    zila = models.CharField(max_length=255, blank=True, null=True)
    mobile = models.CharField(max_length=30, blank=True, null=True)
    nid = models.CharField(max_length=50, blank=True, null=True)

    product_type = models.ForeignKey(ProductType, on_delete=models.CASCADE, related_name="sr_products",default=None)

    bag_type = models.CharField(max_length=200)
    lot_number = models.CharField(max_length=200, blank=True, null=True, default="")
    submitted_bag_quantity = models.PositiveIntegerField(default=0)
    bag_rent = models.DecimalField(max_digits=16, decimal_places=2, default=0)
    total_rent = models.DecimalField(max_digits=16, decimal_places=2, default=0)
    labour_charge = models.DecimalField(max_digits=16, decimal_places=2, default=0)
    grand_total = models.DecimalField(max_digits=18, decimal_places=2, default=0)

    class Meta:
        ordering = ["sr_no"]

    def __str__(self):
        return f"SR-{self.sr_no} ({self.customer_name})"

    def save(self, *args, **kwargs):
        if not self.sr_no:
            last_sr = SR.objects.aggregate(models.Max("sr_no"))["sr_no__max"] or 0
            self.sr_no = last_sr + 1
        super().save(*args, **kwargs)
