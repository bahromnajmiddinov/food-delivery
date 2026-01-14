from django.urls import path
from apps.orders.api.views import (
    OrderListCreateView,
    OrderDetailView,
    OrderStatusUpdateView,
    OrderItemListCreateView,
    ReviewListCreateView,
    NotificationListView,
    NotificationDetailView
)

urlpatterns = [
    path('orders/', OrderListCreateView.as_view(), name='order-list'),
    path('orders/<int:pk>/', OrderDetailView.as_view(), name='order-detail'),
    path('orders/<int:pk>/status/', OrderStatusUpdateView.as_view(), name='order-status-update'),
    path('orders/<int:order_id>/items/', OrderItemListCreateView.as_view(), name='order-item-list'),
    path('reviews/', ReviewListCreateView.as_view(), name='review-list'),
    path('notifications/', NotificationListView.as_view(), name='notification-list'),
    path('notifications/<int:pk>/', NotificationDetailView.as_view(), name='notification-detail'),
]