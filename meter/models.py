from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class WaterMeter(models.Model):
    """Represents a physical water meter device"""
    METER_TYPES = [
        ('analog', 'Analog Meter'),
        ('digital', 'Digital Meter'),
        ('ultrasonic', 'Ultrasonic Meter'),
    ]
    
    meter_id = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=200, blank=True, null=True)
    meter_type = models.CharField(max_length=20, choices=METER_TYPES, default='digital')
    installation_date = models.DateField(default=timezone.now)
    is_active = models.BooleanField(default=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='water_meters')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} ({self.meter_id})"
    
    class Meta:
        ordering = ['-created_at']


class WaterUsage(models.Model):
    """Records water usage data from the meter"""
    meter = models.ForeignKey(WaterMeter, on_delete=models.CASCADE, related_name='usages')
    timestamp = models.DateTimeField(auto_now_add=True)
    volume = models.DecimalField(max_digits=10, decimal_places=3, help_text='Volume in liters')
    flow_rate = models.DecimalField(max_digits=8, decimal_places=3, help_text='Flow rate in L/min')
    temperature = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text='Water temperature in °C')
    is_leak = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.meter.name} - {self.volume}L at {self.timestamp}"
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name_plural = 'Water Usages'


class Alert(models.Model):
    """System alerts for unusual water usage"""
    ALERT_TYPES = [
        ('leak', 'Water Leak Detected'),
        ('high_usage', 'Unusually High Water Usage'),
        ('inactive', 'Meter Inactive'),
        ('other', 'Other'),
    ]
    
    meter = models.ForeignKey(WaterMeter, on_delete=models.CASCADE, related_name='alerts')
    alert_type = models.CharField(max_length=20, choices=ALERT_TYPES)
    message = models.TextField()
    is_resolved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.get_alert_type_display()} - {self.meter.name}"
    
    class Meta:
        ordering = ['-created_at']
