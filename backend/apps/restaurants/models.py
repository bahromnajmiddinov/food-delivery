from django.db import models
from apps.common.models import BaseModel
from apps.accounts.models import User


class Restaurant(BaseModel):
    name = models.CharField(max_length=255)
    image = models.URLField()
    logo = models.URLField()
    rating = models.FloatField(default=0.0)
    delivery_time = models.CharField(max_length=50)
    distance = models.CharField(max_length=50, null=True, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    kitchen_staff = models.ManyToManyField(User, related_name='restaurants', blank=True, limit_choices_to={'role': 'kitchen_staff'})
    is_active = models.BooleanField(default=True)
    opening_time = models.TimeField(null=True, blank=True)
    closing_time = models.TimeField(null=True, blank=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        ordering = ['-rating']
    
    def get_available_menu_items(self):
        """Get menu items that are currently available"""
        return self.menu_items.filter(is_deleted=False)


class MenuItem(BaseModel):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='menu_items')
    name = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.URLField(null=True, blank=True)
    category = models.CharField(max_length=100)
    is_available = models.BooleanField(default=True)
    preparation_time = models.PositiveIntegerField(default=15, help_text="Preparation time in minutes")
    
    def __str__(self):
        return f"{self.name} - {self.restaurant.name}"
    
    class Meta:
        ordering = ['category', 'name']


class Tag(models.Model):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='tags')
    name = models.CharField(max_length=100)
    
    def __str__(self):
        return self.name


class KitchenStaff(BaseModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='kitchen_staff_profile', limit_choices_to={'role': 'kitchen_staff'})
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='staff_members')
    position = models.CharField(max_length=100, choices=[
        ('chef', 'Chef'),
        ('cook', 'Cook'),
        ('manager', 'Manager'),
        ('assistant', 'Assistant')
    ], default='cook')
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.user.name} - {self.position} at {self.restaurant.name}"
    
    class Meta:
        unique_together = ('user', 'restaurant')