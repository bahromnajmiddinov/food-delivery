from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from apps.orders.models import Order, OrderItem, Review, Notification
from apps.orders.api.serializers import OrderSerializer, OrderItemSerializer, ReviewSerializer, NotificationSerializer
from apps.restaurants.models import KitchenStaff, Restaurant
from django.utils import timezone
import random


class OrderListCreateView(generics.ListCreateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # For kitchen staff, show orders for their restaurant
        if user.role == 'kitchen_staff':
            try:
                kitchen_staff = user.kitchen_staff_profile
                return Order.objects.filter(restaurant=kitchen_staff.restaurant)
            except KitchenStaff.DoesNotExist:
                return Order.objects.none()
        
        # For drivers, show their assigned orders
        elif user.role == 'driver':
            return Order.objects.filter(driver=user)
        
        # For customers, show their own orders
        else:
            return Order.objects.filter(customer=user)
    
    def perform_create(self, serializer):
        user = self.request.user
        restaurant_id = self.request.data.get('restaurant')
        
        # Generate order number
        order_number = f"ORD-{random.randint(10000, 99999)}"
        
        # Create order
        order = serializer.save(
            customer=user,
            order_number=order_number,
            status='pending'
        )
        
        # Create notification for customer
        Notification.objects.create(
            user=user,
            title='Order Created',
            message=f'Your order {order_number} has been created and is being processed.',
            notification_type='order',
            order=order
        )
        
        # Create notification for restaurant kitchen staff
        if restaurant_id:
            try:
                restaurant = Restaurant.objects.get(id=restaurant_id)
                kitchen_staff = KitchenStaff.objects.filter(restaurant=restaurant)
                for staff in kitchen_staff:
                    Notification.objects.create(
                        user=staff.user,
                        title='New Order',
                        message=f'New order {order_number} from {user.name} needs preparation.',
                        notification_type='order',
                        order=order
                    )
            except Restaurant.DoesNotExist:
                pass
        
        return order


class OrderDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # For kitchen staff, show orders for their restaurant
        if user.role == 'kitchen_staff':
            try:
                kitchen_staff = user.kitchen_staff_profile
                return Order.objects.filter(restaurant=kitchen_staff.restaurant)
            except KitchenStaff.DoesNotExist:
                return Order.objects.none()
        
        # For drivers, show their assigned orders
        elif user.role == 'driver':
            return Order.objects.filter(driver=user)
        
        # For customers, show their own orders
        else:
            return Order.objects.filter(customer=user)


class OrderStatusUpdateView(generics.UpdateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # Kitchen staff can update orders for their restaurant
        if user.role == 'kitchen_staff':
            return Order.objects.filter(restaurant__kitchen_staff=user)
        
        # Drivers can update their assigned orders
        elif user.role == 'driver':
            return Order.objects.filter(driver=user)
        
        return Order.objects.none()
    
    def perform_update(self, serializer):
        order = self.get_object()
        new_status = self.request.data.get('status')
        
        if new_status:
            old_status = order.status
            order = serializer.save(status=new_status)
            
            # Create notification for status change
            Notification.objects.create(
                user=order.customer,
                title='Order Status Updated',
                message=f'Your order {order.order_number} status changed from {old_status} to {new_status}.',
                notification_type='order',
                order=order
            )
            
            return order
        
        return super().perform_update(serializer)


class OrderItemListCreateView(generics.ListCreateAPIView):
    serializer_class = OrderItemSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        order_id = self.kwargs.get('order_id')
        return OrderItem.objects.filter(order_id=order_id)
    
    def perform_create(self, serializer):
        order_id = self.kwargs.get('order_id')
        serializer.save(order_id=order_id)


class ReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Review.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')


class NotificationDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)
    
    def perform_update(self, serializer):
        # Mark notification as read
        serializer.save(read=True)