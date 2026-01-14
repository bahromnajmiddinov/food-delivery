from django.db import models
from apps.common.models import BaseModel
from apps.accounts.models import User, DeliveryAddress
from apps.restaurants.models import Restaurant, MenuItem


class OrderStatus(models.TextChoices):
    PENDING = 'pending', 'Pending'
    PREPARING = 'preparing', 'Preparing'
    READY = 'ready', 'Ready'
    PICKING_UP = 'picking_up', 'Picking Up'
    DELIVERING = 'delivering', 'Delivering'
    DELIVERED = 'delivered', 'Delivered'
    CANCELLED = 'cancelled', 'Cancelled'


class PaymentMethod(models.TextChoices):
    CASH = 'cash', 'Cash'
    CARD = 'card', 'Card'


class Order(BaseModel):
    order_number = models.CharField(max_length=50, unique=True)
    customer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='customer_orders')
    restaurant = models.ForeignKey(Restaurant, on_delete=models.SET_NULL, null=True, related_name='restaurant_orders')
    delivery_address = models.ForeignKey(DeliveryAddress, on_delete=models.SET_NULL, null=True, related_name='orders')
    driver = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='driver_orders')
    
    status = models.CharField(
        max_length=20,
        choices=OrderStatus.choices,
        default=OrderStatus.PENDING
    )
    payment_method = models.CharField(
        max_length=10,
        choices=PaymentMethod.choices,
        default=PaymentMethod.CASH
    )
    total = models.DecimalField(max_digits=10, decimal_places=2)
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    estimated_delivery_time = models.CharField(max_length=50, null=True, blank=True)
    preparation_time = models.IntegerField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    
    def __str__(self):
        return f"Order {self.order_number} - {self.status}"
    
    class Meta:
        ordering = ['-created_at']


class OrderItem(BaseModel):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    menu_item = models.ForeignKey(MenuItem, on_delete=models.SET_NULL, null=True)
    name = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    category = models.CharField(max_length=100)
    
    def __str__(self):
        return f"{self.quantity}x {self.name} - {self.order.order_number}"


class Review(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveSmallIntegerField()
    comment = models.TextField()
    
    def __str__(self):
        return f"Review by {self.user.name} for Order {self.order.order_number}"


class Notification(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=[
        ('order', 'Order'),
        ('delivery', 'Delivery'),
        ('promotion', 'Promotion'),
        ('system', 'System')
    ])
    read = models.BooleanField(default=False)
    order = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True, blank=True, related_name='notifications')
    
    def __str__(self):
        return f"{self.title} - {self.user.name}"
    
    class Meta:
        ordering = ['-created_at']