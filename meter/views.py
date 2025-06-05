from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Sum, Avg, F, ExpressionWrapper, DurationField, DateTimeField
from django.utils import timezone
from datetime import timedelta
from django.db.models.functions import TruncDay, TruncHour
from django.http import JsonResponse

from .models import WaterMeter, WaterUsage, Alert
from .forms import WaterMeterForm


def home(request):
    """Home page view"""
    if request.user.is_authenticated:
        return redirect('dashboard')
    return render(request, 'meter/home.html')


@login_required
def dashboard(request):
    """User dashboard showing their water meters and usage summary"""
    user_meters = WaterMeter.objects.filter(owner=request.user, is_active=True)
    
    # Get recent water usage data for charts
    recent_usage = WaterUsage.objects.filter(
        meter__in=user_meters
    ).order_by('-timestamp')[:10]
    
    # Get total usage for the current month
    today = timezone.now().date()
    month_start = today.replace(day=1)
    
    monthly_usage = WaterUsage.objects.filter(
        meter__in=user_meters,
        timestamp__date__gte=month_start,
        timestamp__date__lte=today
    ).aggregate(total=Sum('volume'))['total'] or 0
    
    # Get active alerts
    active_alerts = Alert.objects.filter(
        meter__in=user_meters,
        is_resolved=False
    ).order_by('-created_at')
    
    context = {
        'meters': user_meters,
        'recent_usage': recent_usage,
        'monthly_usage': monthly_usage,
        'active_alerts': active_alerts,
    }
    return render(request, 'meter/dashboard.html', context)


@login_required
def meter_detail(request, meter_id):
    """Detailed view for a specific water meter"""
    meter = get_object_or_404(WaterMeter, id=meter_id, owner=request.user)
    
    # Get usage data for the last 7 days
    seven_days_ago = timezone.now() - timedelta(days=7)
    
    # Daily usage for the last 7 days
    daily_usage = WaterUsage.objects.filter(
        meter=meter,
        timestamp__gte=seven_days_ago
    ).annotate(
        day=TruncDay('timestamp', output_field=DateTimeField())
    ).values('day').annotate(
        total_volume=Sum('volume'),
        avg_flow_rate=Avg('flow_rate')
    ).order_by('day')
    
    # Hourly usage for the current day
    today = timezone.now().date()
    hourly_usage = WaterUsage.objects.filter(
        meter=meter,
        timestamp__date=today
    ).annotate(
        hour=TruncHour('timestamp')
    ).values('hour').annotate(
        total_volume=Sum('volume')
    ).order_by('hour')
    
    # Recent readings
    recent_readings = meter.usages.all().order_by('-timestamp')[:10]
    
    context = {
        'meter': meter,
        'daily_usage': list(daily_usage),
        'hourly_usage': list(hourly_usage),
        'recent_readings': recent_readings,
    }
    
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return JsonResponse({
            'daily_usage': list(daily_usage),
            'hourly_usage': list(hourly_usage),
        })
    
    return render(request, 'meter/meter_detail.html', context)


@login_required
def add_meter(request):
    """Add a new water meter"""
    if request.method == 'POST':
        form = WaterMeterForm(request.POST, user=request.user)
        if form.is_valid():
            meter = form.save(commit=False)
            meter.owner = request.user
            meter.save()
            messages.success(request, f'Water meter {meter.name} added successfully!')
            return redirect('meter_detail', meter_id=meter.id)
    else:
        form = WaterMeterForm(user=request.user)
    
    return render(request, 'meter/meter_form.html', {'form': form, 'title': 'Add New Water Meter'})


@login_required
def edit_meter(request, meter_id):
    """Edit an existing water meter"""
    meter = get_object_or_404(WaterMeter, id=meter_id, owner=request.user)
    
    if request.method == 'POST':
        form = WaterMeterForm(request.POST, instance=meter, user=request.user)
        if form.is_valid():
            form.save()
            messages.success(request, f'Water meter {meter.name} updated successfully!')
            return redirect('meter_detail', meter_id=meter.id)
    else:
        form = WaterMeterForm(instance=meter, user=request.user)
    
    return render(request, 'meter/meter_form.html', {
        'form': form,
        'title': f'Edit {meter.name}',
        'meter': meter
    })


@login_required
def delete_meter(request, meter_id):
    """Delete a water meter"""
    meter = get_object_or_404(WaterMeter, id=meter_id, owner=request.user)
    if request.method == 'POST':
        meter_name = meter.name
        meter.delete()
        messages.success(request, f'Water meter {meter_name} has been deleted.')
        return redirect('dashboard')
    
    return render(request, 'meter/meter_confirm_delete.html', {'meter': meter})


@login_required
def api_water_usage(request):
    """API endpoint to record water usage from Arduino"""
    if request.method == 'POST':
        try:
            meter_id = request.POST.get('meter_id')
            volume = float(request.POST.get('volume', 0))
            flow_rate = float(request.POST.get('flow_rate', 0))
            temperature = float(request.POST.get('temperature', 0)) if 'temperature' in request.POST else None
            
            # Get the meter (verify ownership)
            meter = get_object_or_404(WaterMeter, meter_id=meter_id, owner=request.user)
            
            # Create water usage record
            usage = WaterUsage.objects.create(
                meter=meter,
                volume=volume,
                flow_rate=flow_rate,
                temperature=temperature,
                is_leak=flow_rate > 5.0  # Simple leak detection (adjust threshold as needed)
            )
            
            # Check for potential leaks or unusual usage
            if usage.is_leak:
                Alert.objects.create(
                    meter=meter,
                    alert_type='leak',
                    message=f'Possible water leak detected with flow rate of {flow_rate} L/min.'
                )
            
            return JsonResponse({'status': 'success'})
            
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)
