import React, { useState, useEffect } from 'react';
import axios from 'axios';
import WelcomePage from './WelcomePage';
import Sidebar from './Sidebar';
import AdminDashboard from './AdminDashboard';
import ManualEntry from './ManualEntry';
import History from './History';
import IconCard from './IconCard';
import DetailsModal from './DetailsModal';
import ArchiveModal from './ArchiveModal';
import { FileText, UploadCloud } from 'lucide-react';

function App() {
  const [page, setPage] = useState('welcome');
  const [employees, setEmployees] = useState([]);
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState([]);
  const [expandedRunId, setExpandedRunId] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [detailsData, setDetailsData] = useState([]);
  const [showArchive, setShowArchive] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch employees
  const fetchEmployees = async () => {
    const res = await axios.get('/api/payroll/employees/');
    setEmployees(res.data);
  };

  // Fetch payroll results
  const fetchResults = async () => {
    const res = await axios.get('/api/payroll/payroll-results/');
    setResults(res.data);
  };

  // Fetch payroll history
  const fetchHistory = async () => {
    const res = await axios.get('/api/payroll/payroll-runs/');
    // For each run, fetch its results
    const runs = await Promise.all(res.data.map(async run => {
      const r = await axios.get(`/api/payroll/payroll-runs/${run.id}/results/`);
      return { ...run, results: r.data };
    }));
    setHistory(runs);
  };

  useEffect(() => {
    if (page !== 'welcome') {
      fetchEmployees();
      fetchResults();
      fetchHistory();
    }
    // eslint-disable-next-line
  }, [page]);

  // File upload handler
  const handleUpload = async (type, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_type', type);
    setLoading(true);
    try {
      await axios.post('/api/payroll/upload/', formData);
      fetchEmployees();
      fetchResults();
    } catch (e) {
      alert(e.response?.data?.error || 'Upload failed');
    }
    setLoading(false);
  };

  // Manual entry submit
  const handleManualSubmit = async ({ employee, amount, remark, attachment }) => {
    const formData = new FormData();
    formData.append('employee', employee);
    formData.append('amount', amount);
    formData.append('component_type', 'incentive');
    formData.append('source_file', 'manual_entry');
    if (remark) formData.append('remark', remark);
    if (attachment) formData.append('attachment', attachment);
    setLoading(true);
    try {
      await axios.post('/api/payroll/components/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      fetchResults();
    } catch (e) {
      alert(e.response?.data?.error || 'Manual entry failed');
    }
    setLoading(false);
  };

  // Calculate payrolls
  const handleCalculate = async () => {
    setLoading(true);
    try {
      await axios.post('/api/payroll/calculate/');
      fetchResults();
    } catch (e) {
      alert(e.response?.data?.error || 'Calculation failed');
    }
    setLoading(false);
  };

  // Save to history
  const handleSaveToHistory = () => setShowArchive(true);
  const handleArchive = async (runName) => {
    setShowArchive(false);
    setLoading(true);
    try {
      await axios.post('/api/payroll/archive/', { run_name: runName });
      fetchResults();
      fetchHistory();
    } catch (e) {
      alert(e.response?.data?.error || 'Archiving failed');
    }
    setLoading(false);
  };

  // Show details modal
  const handleShowDetails = (result) => {
    const details = [];
    if (result.components_snapshot) {
      (result.components_snapshot.incentives || []).forEach(d => details.push({ ...d, type: 'Incentive' }));
      (result.components_snapshot.deductions || []).forEach(d => details.push({ ...d, type: 'Deduction' }));
    }
    setDetailsData(details);
    setShowDetails(true);
  };

  // Open file/attachment
  const handleOpenFile = (filename) => {
    window.open(`/api/payroll/files/${filename}/`, '_blank');
  };

  // Delete payroll run
  const handleDeleteRun = async (run) => {
    if (!window.confirm('Are you sure you want to delete this payroll run?')) return;
    setLoading(true);
    try {
      await axios.delete(`/api/payroll/payroll-runs/${run.id}/delete_run/`);
      fetchHistory();
    } catch (e) {
      alert(e.response?.data?.error || 'Delete failed');
    }
    setLoading(false);
  };

  // Reset table handler
  const handleReset = async () => {
    if (!window.confirm('Are you sure you want to reset all incentives and deductions? This cannot be undone.')) return;
    setLoading(true);
    try {
      await axios.post('/api/payroll/reset-components/');
      fetchResults();
    } catch (e) {
      alert(e.response?.data?.error || 'Reset failed');
    }
    setLoading(false);
  };

  // Approve payroll result
  const handleApprove = async (result) => {
    setLoading(true);
    try {
      await axios.post(`/api/payroll/payroll-results/${result.id}/approve/`);
      fetchResults();
    } catch (e) {
      alert(e.response?.data?.error || 'Approval failed');
    }
    setLoading(false);
  };

  // Reject payroll result
  const handleReject = async (result) => {
    const reason = window.prompt('Enter rejection reason:');
    if (!reason) return;
    setLoading(true);
    try {
      await axios.post(`/api/payroll/payroll-results/${result.id}/reject/`, { reason });
      fetchResults();
    } catch (e) {
      alert(e.response?.data?.error || 'Rejection failed');
    }
    setLoading(false);
  };

  // Navigation
  if (page === 'welcome') {
    return <WelcomePage onGetStarted={() => setPage('dashboard')} />;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar currentPage={page} onNavigate={setPage} />
      <main className="flex-1">
        {page === 'dashboard' && (
          <AdminDashboard
            onUpload={handleUpload}
            onCalculate={handleCalculate}
            onSaveToHistory={handleSaveToHistory}
            results={results}
            onShowDetails={handleShowDetails}
            onReset={handleReset}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        )}
        {page === 'manual' && (
          <ManualEntry employees={employees} onSubmit={handleManualSubmit} loading={loading} />
        )}
        {page === 'history' && (
          <History
            runs={history}
            onExpand={run => setExpandedRunId(expandedRunId === run.id ? null : run.id)}
            expandedRunId={expandedRunId}
            onDelete={handleDeleteRun}
          />
        )}
      </main>
      <DetailsModal open={showDetails} onClose={() => setShowDetails(false)} details={detailsData} onOpenFile={handleOpenFile} />
      <ArchiveModal open={showArchive} onClose={() => setShowArchive(false)} onSave={handleArchive} />
    </div>
  );
}

export default App;
