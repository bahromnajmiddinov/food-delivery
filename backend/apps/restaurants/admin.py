from django.contrib import admin

from apps.restaurants.models import (
    Restaurant,
    MenuItem,
    KitchenStaff,
)


@admin.register(Restaurant)
class RestaurantAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'is_active', 'opening_time', 'closing_time', 'type')
    search_fields = ('name',)
    list_filter = ('is_active', 'type')
    

@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'restaurant', 'price', 'is_available')
    search_fields = ('name', 'restaurant__name')
    list_filter = ('is_available',)
    

@admin.register(KitchenStaff)
class KitchenStaffAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'restaurant', 'position', 'is_active')
    search_fields = ('user__username', 'restaurant__name', 'position')
    list_filter = ('position', 'is_active')
