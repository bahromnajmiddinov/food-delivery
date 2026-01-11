from django.urls import path
from apps.restaurants.api.views import (
    RestaurantListView,
    RestaurantDetailView,
    MenuItemListView,
    MenuItemDetailView,
    PopularRestaurantsView,
    KitchenStaffListCreateView,
    KitchenStaffDetailView,
    MyRestaurantOrdersView
)

urlpatterns = [
    path('restaurants/', RestaurantListView.as_view(), name='restaurant-list'),
    path('restaurants/<int:pk>/', RestaurantDetailView.as_view(), name='restaurant-detail'),
    path('restaurants/<int:restaurant_id>/menu/', MenuItemListView.as_view(), name='menu-item-list'),
    path('menu-items/<int:pk>/', MenuItemDetailView.as_view(), name='menu-item-detail'),
    path('restaurants/popular/', PopularRestaurantsView.as_view(), name='popular-restaurants'),
    path('kitchen-staff/', KitchenStaffListCreateView.as_view(), name='kitchen-staff-list'),
    path('kitchen-staff/<int:pk>/', KitchenStaffDetailView.as_view(), name='kitchen-staff-detail'),
    path('my-restaurant-orders/', MyRestaurantOrdersView.as_view(), name='my-restaurant-orders'),
]