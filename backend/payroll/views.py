from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets, filters
from .models import Employee, Component, PayrollResult, PayrollRun, ArchivedPayrollResult
from .serializers import EmployeeSerializer, ComponentSerializer, PayrollResultSerializer, PayrollRunSerializer, ArchivedPayrollResultSerializer
from django.core.files.storage import default_storage
from django.conf import settings
import os
import pandas as pd
from rest_framework.decorators import action, api_view
from django_filters.rest_framework import DjangoFilterBackend
from django.http import FileResponse, Http404
from django.urls import path, include
from rest_framework.permissions import AllowAny

# Create your views here.

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer

class PayrollResultViewSet(viewsets.ModelViewSet):
    queryset = PayrollResult.objects.all()
    serializer_class = PayrollResultSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['status']
    search_fields = ['employee__name', 'employee__employee_id']

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        payroll = self.get_object()
        if payroll.status != 'pending':
            return Response({'error': 'Only pending payrolls can be approved.'}, status=400)
        payroll.status = 'approved'
        payroll.save()
        return Response({'status': 'approved'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        payroll = self.get_object()
        if payroll.status != 'pending':
            return Response({'error': 'Only pending payrolls can be rejected.'}, status=400)
        reason = request.data.get('reason')
        if not reason:
            return Response({'error': 'Rejection reason is required.'}, status=400)
        payroll.status = 'rejected'
        payroll.rejection_reason = reason
        payroll.save()
        return Response({'status': 'rejected', 'reason': reason})

    @action(detail=True, methods=['get'])
    def audit(self, request, pk=None):
        payroll = self.get_object()
        return Response(payroll.components_snapshot)

class FileUploadAPIView(APIView):
    def post(self, request, *args, **kwargs):
        uploaded_file = request.FILES.get('file')
        file_type = request.data.get('file_type')  # 'master', 'incentive', 'deduction'
        if not uploaded_file or not file_type:
            return Response({'error': 'File and file_type are required.'}, status=status.HTTP_400_BAD_REQUEST)
        save_path = os.path.join(settings.MEDIA_ROOT, uploaded_file.name)
        os.makedirs(settings.MEDIA_ROOT, exist_ok=True)
        with default_storage.open(save_path, 'wb+') as destination:
            for chunk in uploaded_file.chunks():
                destination.write(chunk)

        # Parse the file using pandas
        try:
            if uploaded_file.name.endswith('.csv'):
                df = pd.read_csv(save_path)
            else:
                df = pd.read_excel(save_path)
        except Exception as e:
            return Response({'error': f'Failed to parse file: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

        # Clean numerical columns (remove $ and commas)
        def clean_amount(val):
            if pd.isnull(val):
                return 0
            if isinstance(val, str):
                val = val.replace('$', '').replace(',', '').strip()
            try:
                return float(val)
            except Exception:
                return 0

        if file_type == 'master':
            required_cols = {'employee_id', 'name', 'base_salary'}
            if not required_cols.issubset(df.columns):
                return Response({'error': f'Master file must contain columns: {required_cols}'}, status=status.HTTP_400_BAD_REQUEST)
            for idx, row in df.iterrows():
                try:
                    emp, _ = Employee.objects.update_or_create(
                        employee_id=row['employee_id'],
                        defaults={
                            'name': row['name'],
                            'base_salary': clean_amount(row['base_salary'])
                        }
                    )
                except Exception as e:
                    return Response({'error': f'Failed to process row {idx+2}: {str(e)}', 'row': row.to_dict()}, status=status.HTTP_400_BAD_REQUEST)
            return Response({'status': 'Master file uploaded and employees updated.'}, status=status.HTTP_201_CREATED)
        elif file_type in ['incentive', 'deduction']:
            # Prevent duplicate file upload
            if Component.objects.filter(source_file=uploaded_file.name, component_type=file_type).exists():
                return Response({'error': f'{file_type.title()} file "{uploaded_file.name}" has already been uploaded.'}, status=status.HTTP_400_BAD_REQUEST)
            required_cols = {'employee_id', 'amount'}
            if not required_cols.issubset(df.columns):
                return Response({'error': f'{file_type.title()} file must contain columns: {required_cols}'}, status=status.HTTP_400_BAD_REQUEST)
            created_count = 0
            for _, row in df.iterrows():
                try:
                    emp = Employee.objects.get(employee_id=row['employee_id'])
                except Employee.DoesNotExist:
                    continue  # skip unknown employees
                Component.objects.create(
                    employee=emp,
                    amount=clean_amount(row['amount']),
                    component_type=file_type,
                    source_file=uploaded_file.name
                )
                created_count += 1
            return Response({'filename': uploaded_file.name, 'file_type': file_type, 'rows': len(df), 'created': created_count}, status=status.HTTP_201_CREATED)
        else:
            return Response({'error': 'Invalid file_type.'}, status=status.HTTP_400_BAD_REQUEST)

class PayrollCalculationAPIView(APIView):
    def post(self, request, *args, **kwargs):
        # Delete all previous payroll results
        PayrollResult.objects.all().delete()

        results = []
        for emp in Employee.objects.all():
            # Get all incentives and deductions for this employee
            incentives = Component.objects.filter(employee=emp, component_type='incentive')
            deductions = Component.objects.filter(employee=emp, component_type='deduction')
            total_incentive = sum([float(c.amount) for c in incentives])
            total_deduction = sum([float(c.amount) for c in deductions])
            final_salary = float(emp.base_salary) + total_incentive - total_deduction

            # Prepare snapshot for audit (list of dicts with amount, type, source_file)
            components_snapshot = {
                'incentives': [
                    {'amount': float(c.amount), 'source_file': c.source_file, 'id': c.id}
                    for c in incentives
                ],
                'deductions': [
                    {'amount': float(c.amount), 'source_file': c.source_file, 'id': c.id}
                    for c in deductions
                ]
            }

            payroll = PayrollResult.objects.create(
                employee=emp,
                final_salary=final_salary,
                status='pending',
                components_snapshot=components_snapshot
            )
            results.append({
                'employee_id': emp.employee_id,
                'final_salary': final_salary,
                'payroll_id': payroll.id
            })

        return Response({'status': 'Payrolls calculated', 'results': results}, status=status.HTTP_200_OK)

class UploadedFileListAPIView(APIView):
    def get(self, request, *args, **kwargs):
        media_dir = settings.MEDIA_ROOT
        files = []
        for fname in os.listdir(media_dir):
            fpath = os.path.join(media_dir, fname)
            if os.path.isfile(fpath):
                files.append({
                    'filename': fname,
                    'url': request.build_absolute_uri(settings.MEDIA_URL + fname)
                })
        return Response({'files': files})

class UploadedFileDownloadAPIView(APIView):
    def get(self, request, filename, *args, **kwargs):
        file_path = os.path.join(settings.MEDIA_ROOT, filename)
        if not os.path.exists(file_path):
            raise Http404
        return FileResponse(open(file_path, 'rb'), as_attachment=True, filename=filename)

@api_view(['POST'])
def reset_components(request):
    Component.objects.filter(component_type__in=['incentive', 'deduction']).delete()
    PayrollResult.objects.all().delete()
    return Response({'status': 'All incentive and deduction components and payroll results deleted.'}, status=200)

class PayrollRunViewSet(viewsets.ModelViewSet):
    queryset = PayrollRun.objects.all().order_by('-run_timestamp')
    serializer_class = PayrollRunSerializer
    permission_classes = [AllowAny]

    @action(detail=True, methods=['get'])
    def results(self, request, pk=None):
        run = self.get_object()
        results = ArchivedPayrollResult.objects.filter(payroll_run=run)
        serializer = ArchivedPayrollResultSerializer(results, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['delete'])
    def delete_run(self, request, pk=None):
        run = self.get_object()
        run.delete()
        return Response({'status': 'deleted'})

class ArchivedPayrollResultViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ArchivedPayrollResult.objects.all()
    serializer_class = ArchivedPayrollResultSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['payroll_run', 'employee']
    search_fields = ['employee__name', 'employee__employee_id']

class ArchivePayrollAPIView(APIView):
    def post(self, request, *args, **kwargs):
        run_name = request.data.get('run_name')
        if not run_name:
            return Response({'error': 'run_name is required.'}, status=400)
        payroll_run = PayrollRun.objects.create(run_name=run_name)
        for pr in PayrollResult.objects.all():
            ArchivedPayrollResult.objects.create(
                payroll_run=payroll_run,
                employee=pr.employee,
                final_salary=pr.final_salary,
                status=pr.status,
                rejection_reason=pr.rejection_reason,
                calculated_at=pr.calculated_at,
                components_snapshot=pr.components_snapshot
            )
        PayrollResult.objects.all().delete()
        return Response({'status': 'archived', 'run_id': payroll_run.id, 'run_name': payroll_run.run_name})
