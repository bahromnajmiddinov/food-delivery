from django.db import models
from apps.common.models import BaseModel


class Restaurant(BaseModel):
    name = models.CharField(max_length=255)
    image = models.URLField()
    logo = models.URLField()
    rating = models.FloatField(default=0.0)
    delivery_time = models.CharField(max_length=50)
    distance = models.CharField(max_length=50, null=True, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        ordering = ['-rating']


class MenuItem(BaseModel):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='menu_items')
    name = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.URLField(null=True, blank=True)
    category = models.CharField(max_length=100)
    
    def __str__(self):
        return f"{self.name} - {self.restaurant.name}"


class Tag(models.Model):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='tags')
    name = models.CharField(max_length=100)
    
    def __str__(self):
        return self.name