from django.contrib import admin
from .models import Employee, Component, PayrollResult

# Register your models here.
admin.site.register(Employee)
admin.site.register(Component)
admin.site.register(PayrollResult)
