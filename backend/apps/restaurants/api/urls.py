from django.urls import path
from apps.restaurants.api.views import (
    RestaurantListView,
    RestaurantDetailView,
    MenuItemListView,
    MenuItemDetailView,
    PopularRestaurantsView
)

urlpatterns = [
    path('restaurants/', RestaurantListView.as_view(), name='restaurant-list'),
    path('restaurants/<int:pk>/', RestaurantDetailView.as_view(), name='restaurant-detail'),
    path('restaurants/<int:restaurant_id>/menu/', MenuItemListView.as_view(), name='menu-item-list'),
    path('menu-items/<int:pk>/', MenuItemDetailView.as_view(), name='menu-item-detail'),
    path('restaurants/popular/', PopularRestaurantsView.as_view(), name='popular-restaurants'),
]