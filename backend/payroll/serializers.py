from rest_framework import serializers
from .models import Employee, Component, PayrollResult, PayrollRun, ArchivedPayrollResult

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = ['id', 'employee_id', 'name', 'base_salary']

class ComponentSerializer(serializers.ModelSerializer):
    attachment = serializers.FileField(required=False, allow_null=True)
    class Meta:
        model = Component
        fields = ['id', 'employee', 'amount', 'component_type', 'source_file', 'uploaded_at', 'remark', 'attachment']

class PayrollResultSerializer(serializers.ModelSerializer):
    employee = EmployeeSerializer(read_only=True)
    class Meta:
        model = PayrollResult
        fields = ['id', 'employee', 'final_salary', 'status', 'rejection_reason', 'calculated_at', 'components_snapshot']

class PayrollRunSerializer(serializers.ModelSerializer):
    class Meta:
        model = PayrollRun
        fields = ['id', 'run_name', 'run_timestamp']

class ArchivedPayrollResultSerializer(serializers.ModelSerializer):
    employee = EmployeeSerializer(read_only=True)
    payroll_run = PayrollRunSerializer(read_only=True)
    class Meta:
        model = ArchivedPayrollResult
        fields = ['id', 'payroll_run', 'employee', 'final_salary', 'status', 'rejection_reason', 'calculated_at', 'components_snapshot'] 