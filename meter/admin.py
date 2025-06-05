from django.contrib import admin
from .models import WaterMeter, WaterUsage, Alert
from django.utils.html import format_html
from django.utils import timezone


class WaterUsageInline(admin.TabularInline):
    model = WaterUsage
    extra = 0
    readonly_fields = ('timestamp', 'volume', 'flow_rate', 'temperature', 'is_leak')
    can_delete = False
    show_change_link = True


class AlertInline(admin.TabularInline):
    model = Alert
    extra = 0
    readonly_fields = ('alert_type', 'message', 'created_at', 'is_resolved')
    can_delete = False
    show_change_link = True


@admin.register(WaterMeter)
class WaterMeterAdmin(admin.ModelAdmin):
    list_display = ('name', 'meter_id', 'meter_type', 'location', 'is_active', 'created_at')
    list_filter = ('meter_type', 'is_active', 'created_at')
    search_fields = ('name', 'meter_id', 'location')
    inlines = [WaterUsageInline, AlertInline]
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Meter Information', {
            'fields': ('name', 'meter_id', 'meter_type', 'owner')
        }),
        ('Location', {
            'fields': ('location', 'installation_date'),
        }),
        ('Status', {
            'fields': ('is_active',),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )


@admin.register(WaterUsage)
class WaterUsageAdmin(admin.ModelAdmin):
    list_display = ('meter', 'timestamp', 'volume', 'flow_rate', 'temperature', 'is_leak')
    list_filter = ('is_leak', 'timestamp')
    search_fields = ('meter__name', 'meter__meter_id')
    readonly_fields = ('timestamp',)
    date_hierarchy = 'timestamp'


@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display = ('meter', 'alert_type', 'message_short', 'is_resolved', 'created_at')
    list_filter = ('alert_type', 'is_resolved', 'created_at')
    search_fields = ('meter__name', 'message')
    readonly_fields = ('created_at', 'resolved_at')
    actions = ['mark_as_resolved']

    def message_short(self, obj):
        return f"{obj.message[:50]}..." if len(obj.message) > 50 else obj.message
    message_short.short_description = 'Message'

    def mark_as_resolved(self, request, queryset):
        updated = queryset.update(is_resolved=True, resolved_at=timezone.now())
        self.message_user(request, f"{updated} alert(s) marked as resolved.")
    mark_as_resolved.short_description = "Mark selected alerts as resolved"
