from django.db import models

# Create your models here.

class Client(models.Model):
    ip = models.CharField(max_length=25, primary_key=True)
    user = models.CharField(max_length=25, default="")
    name = models.CharField(max_length=50, default="")