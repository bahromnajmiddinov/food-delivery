from rest_framework import serializers
from apps.orders.models import Order, OrderItem, Review, Notification


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['id', 'order', 'menu_item', 'name', 'description', 'price', 'quantity', 'category']
        read_only_fields = ['id', 'order']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'customer', 'restaurant', 'delivery_address', 'driver',
            'status', 'payment_method', 'total', 'delivery_fee', 'estimated_delivery_time',
            'preparation_time', 'notes', 'items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'order_number', 'created_at', 'updated_at']


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['id', 'user', 'order', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'user', 'order', 'created_at']


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'user', 'title', 'message', 'notification_type', 'read', 'order', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']