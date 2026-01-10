from rest_framework import serializers
from apps.restaurants.models import Restaurant, MenuItem, Tag


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']


class MenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = ['id', 'restaurant', 'name', 'description', 'price', 'image', 'category']
        read_only_fields = ['id', 'restaurant']


class RestaurantSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, read_only=True)
    menu_items = MenuItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Restaurant
        fields = ['id', 'name', 'image', 'logo', 'rating', 'delivery_time', 'distance', 'latitude', 'longitude', 'tags', 'menu_items']
        read_only_fields = ['id']