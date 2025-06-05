from django.urls import path
from . import views

app_name = 'meter'

urlpatterns = [
    # Public pages
    path('', views.home, name='home'),
    
    # Dashboard and meter management
    path('dashboard/', views.dashboard, name='dashboard'),
    path('meter/add/', views.add_meter, name='add_meter'),
    path('meter/<int:meter_id>/', views.meter_detail, name='meter_detail'),
    path('meter/<int:meter_id>/edit/', views.edit_meter, name='edit_meter'),
    path('meter/<int:meter_id>/delete/', views.delete_meter, name='delete_meter'),
    
    # API Endpoints
    path('api/water-usage/', views.api_water_usage, name='api_water_usage'),
]
