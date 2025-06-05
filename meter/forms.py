from django import forms
from .models import WaterMeter
from django.core.exceptions import ValidationError

class WaterMeterForm(forms.ModelForm):
    """Form for adding/editing water meters"""
    class Meta:
        model = WaterMeter
        fields = ['name', 'meter_id', 'meter_type', 'location', 'installation_date', 'is_active']
        widgets = {
            'installation_date': forms.DateInput(attrs={'type': 'date'}),
            'is_active': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
        }
    
    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)
        
        # Add Bootstrap classes to form fields
        for field_name, field in self.fields.items():
            if field_name != 'is_active':
                field.widget.attrs.update({'class': 'form-control'})
    
    def clean_meter_id(self):
        """Ensure meter_id is unique for the user"""
        meter_id = self.cleaned_data.get('meter_id')
        if not meter_id:
            raise ValidationError("Meter ID is required.")
            
        # Check if this meter_id already exists for this user
        qs = WaterMeter.objects.filter(
            owner=self.user,
            meter_id=meter_id
        )
        
        if self.instance and self.instance.pk:
            qs = qs.exclude(pk=self.instance.pk)
            
        if qs.exists():
            raise ValidationError("A meter with this ID already exists in your account.")
            
        return meter_id
