from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FileUploadAPIView, PayrollCalculationAPIView, EmployeeViewSet, PayrollResultViewSet, UploadedFileListAPIView, UploadedFileDownloadAPIView, reset_components, PayrollRunViewSet, ArchivedPayrollResultViewSet, ArchivePayrollAPIView

router = DefaultRouter()
router.register(r'employees', EmployeeViewSet)
router.register(r'payroll-results', PayrollResultViewSet)
router.register(r'payroll-runs', PayrollRunViewSet)
router.register(r'archived-payroll-results', ArchivedPayrollResultViewSet, basename='archived-payroll-result')

urlpatterns = [
    path('upload/', FileUploadAPIView.as_view(), name='file-upload'),
    path('calculate/', PayrollCalculationAPIView.as_view(), name='payroll-calculate'),
    path('files/', UploadedFileListAPIView.as_view(), name='uploaded-files-list'),
    path('files/<str:filename>/', UploadedFileDownloadAPIView.as_view(), name='uploaded-file-download'),
    path('reset-components/', reset_components, name='reset-components'),
    path('archive/', ArchivePayrollAPIView.as_view(), name='payroll-archive'),
    path('', include(router.urls)),
] 