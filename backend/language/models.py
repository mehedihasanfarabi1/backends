from django.db import models
from backend.mixins import AuditMixin


class Translation(AuditMixin):

    key = models.CharField(max_length=255, unique=True)   # unique identifier
    english = models.CharField(max_length=255,blank=True, null=True)            # English text
    bangla = models.CharField(max_length=255,blank=True, null=True)             # Bangla text
    arabian = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"{self.key} ({self.english} / {self.bangla})"
