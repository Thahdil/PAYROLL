import React, { useState } from 'react';
import IconCard from './IconCard';
import { UploadCloud } from 'lucide-react';

export default function AdminDashboard({ onUpload, onCalculate, onSaveToHistory, results, onShowDetails, onReset, onApprove, onReject }) {
  const [uploadStatus, setUploadStatus] = useState({ master: '', incentive: {}, deduction: {} });
  const [loadingType, setLoadingType] = useState('');

  const handleUploadWithStatus = async (type, files) => {
    if (!files || files.length === 0) return;
    if (type === 'master') {
      setLoadingType(type);
      setUploadStatus(s => ({ ...s, [type]: 'uploading' }));
      await onUpload(type, files[0]);
      setLoadingType('');
      setUploadStatus(s => ({ ...s, [type]: 'success' }));
      setTimeout(() => setUploadStatus(s => ({ ...s, [type]: '' })), 2000);
    } else {
      let statusObj = {};
      setLoadingType(type);
      for (let file of files) {
        setUploadStatus(s => ({ ...s, [type]: { ...s[type], [file.name]: 'uploading' } }));
        await onUpload(type, file);
        setUploadStatus(s => ({ ...s, [type]: { ...s[type], [file.name]: 'success' } }));
        statusObj[file.name] = 'success';
      }
      setLoadingType('');
      setTimeout(() => setUploadStatus(s => ({ ...s, [type]: {} })), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-8 p-8 w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mb-4 justify-items-center">
        {/* Upload Cards */}
        <IconCard
          icon={<UploadCloud size={48} />}
          title="Upload Employee Master"
          onUpload={files => handleUploadWithStatus('master', files)}
          accept=".xlsx,.csv"
          cardWidth="w-72"
          loading={loadingType === 'master'}
          uploadStatus={uploadStatus.master}
          multiple={false}
        />
        <IconCard
          icon={<UploadCloud size={48} />}
          title="Upload Incentive File(s)"
          onUpload={files => handleUploadWithStatus('incentive', files)}
          accept=".xlsx,.csv"
          cardWidth="w-72"
          loading={loadingType === 'incentive'}
          uploadStatus={uploadStatus.incentive}
          multiple={true}
        />
        <IconCard
          icon={<UploadCloud size={48} />}
          title="Upload Deduction File(s)"
          onUpload={files => handleUploadWithStatus('deduction', files)}
          accept=".xlsx,.csv"
          cardWidth="w-72"
          loading={loadingType === 'deduction'}
          uploadStatus={uploadStatus.deduction}
          multiple={true}
        />
      </div>
      <div className="flex justify-between items-center mt-8">
        <h2 className="text-2xl font-bold">Review & Approve Results</h2>
        <button className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700" onClick={onCalculate}>Calculate All Payrolls</button>
      </div>
      <div className="bg-white rounded-lg shadow p-6 mt-4">
        {/* Results Table */}
        <table className="min-w-full text-left">
          <thead>
            <tr>
              <th className="py-2 px-4">Employee ID</th>
              <th className="py-2 px-4">Name</th>
              <th className="py-2 px-4">Base Salary</th>
              <th className="py-2 px-4">Incentives</th>
              <th className="py-2 px-4">Deductions</th>
              <th className="py-2 px-4">Final Salary</th>
              <th className="py-2 px-4">Status</th>
              <th className="py-2 px-4">Details</th>
            </tr>
          </thead>
          <tbody>
            {results && results.length > 0 ? results.map(r => {
              const incentives = r.components_snapshot?.incentives?.reduce((a, c) => a + Number(c.amount), 0) || 0;
              const deductions = r.components_snapshot?.deductions?.reduce((a, c) => a + Number(c.amount), 0) || 0;
              return (
                <tr key={r.id} className="border-t">
                  <td className="py-2 px-4">{r.employee?.employee_id}</td>
                  <td className="py-2 px-4">{r.employee?.name}</td>
                  <td className="py-2 px-4">${Number(r.employee?.base_salary || 0).toLocaleString()}</td>
                  <td className="py-2 px-4 text-blue-600 underline cursor-pointer" onClick={() => onShowDetails({ ...r, detailsType: 'incentives' })}>{incentives.toLocaleString()}</td>
                  <td className="py-2 px-4 text-blue-600 underline cursor-pointer" onClick={() => onShowDetails({ ...r, detailsType: 'deductions' })}>{deductions.toLocaleString()}</td>
                  <td className="py-2 px-4">${Number(r.final_salary).toLocaleString()}</td>
                  <td className="py-2 px-4">
                    {r.status === 'pending' ? (
                      <div className="flex gap-2">
                        <button className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600" onClick={() => onApprove(r)}>Approve</button>
                        <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600" onClick={() => onReject(r)}>Reject</button>
                      </div>
                    ) : (
                      r.status.charAt(0).toUpperCase() + r.status.slice(1)
                    )}
                  </td>
                  <td className="py-2 px-4">
                    <button className="text-blue-600 underline" onClick={() => onShowDetails(r)}>View</button>
                  </td>
                </tr>
              );
            }) : <tr><td colSpan={8} className="text-center py-4 text-gray-400">No results yet.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between mt-4">
        <button className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700" onClick={onSaveToHistory}>Save to History</button>
        <button className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 ml-4" onClick={onReset}>Reset Table</button>
      </div>
    </div>
  );
} 