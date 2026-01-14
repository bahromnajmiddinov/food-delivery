from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView
)

from django.contrib import admin
from django.urls import path, include


api_v1_patterns = [
    path('schema/', SpectacularAPIView.as_view(), name='schema'),
    path('schema/swagger/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('schema/redoc/', SpectacularRedocView.as_view(url_name='schema'),
            name='redoc'),
    # App URLs
    # path('products/', include('apps.products.api.urls')),
    path('accounts/', include('apps.accounts.api.urls')),
    path('restaurants/', include('apps.restaurants.api.urls')),
    path('orders/', include('apps.orders.api.urls')),
]


urlpatterns = [
    path('admin/', admin.site.urls),
        
    # API schema and documentation
    path('api/v1/', include(api_v1_patterns)),
]
