from django.db import models
from backend.mixins import AuditMixin



class Booking(AuditMixin):
   
    name = models.CharField(max_length=255)
    desc = models.TextField(blank=True, null=True,default="")   

    def __str__(self):
        return f"{self.name}"
