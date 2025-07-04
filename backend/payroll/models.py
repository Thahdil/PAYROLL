from django.db import models

# Create your models here.

class Employee(models.Model):
    employee_id = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=255)
    base_salary = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f"{self.employee_id} - {self.name}"

class Component(models.Model):
    COMPONENT_TYPE_CHOICES = [
        ("incentive", "Incentive"),
        ("deduction", "Deduction"),
    ]
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    component_type = models.CharField(max_length=10, choices=COMPONENT_TYPE_CHOICES)
    source_file = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    remark = models.CharField(max_length=255, blank=True, null=True)
    attachment = models.FileField(upload_to='attachments/', blank=True, null=True)

class PayrollResult(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    final_salary = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="pending")
    rejection_reason = models.TextField(blank=True, null=True)
    calculated_at = models.DateTimeField(auto_now_add=True)
    components_snapshot = models.JSONField()

    def __str__(self):
        return f"PayrollResult({self.employee.employee_id}, {self.final_salary})"

class PayrollRun(models.Model):
    run_name = models.CharField(max_length=255)
    run_timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"PayrollRun({self.run_name}, {self.run_timestamp})"

class ArchivedPayrollResult(models.Model):
    payroll_run = models.ForeignKey(PayrollRun, on_delete=models.CASCADE, related_name='archived_results')
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    final_salary = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=10, choices=PayrollResult.STATUS_CHOICES, default="pending")
    rejection_reason = models.TextField(blank=True, null=True)
    calculated_at = models.DateTimeField()
    components_snapshot = models.JSONField()

    def __str__(self):
        return f"ArchivedPayrollResult({self.employee.employee_id}, {self.final_salary}, {self.payroll_run.run_name})"
