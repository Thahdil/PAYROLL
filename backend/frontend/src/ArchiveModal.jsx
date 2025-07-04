import React, { useState } from 'react';

export default function ArchiveModal({ open, onClose, onSave }) {
  const [runName, setRunName] = useState('');
  if (!open) return null;
  const handleSave = () => {
    let name = runName.trim();
    if (!name) {
      const now = new Date();
      name = now.toLocaleString();
    }
    onSave(name);
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 min-w-[350px] relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={onClose}>&times;</button>
        <h3 className="text-xl font-bold mb-4">Save Payroll Run to History</h3>
        <input
          type="text"
          className="w-full border rounded px-3 py-2 mb-4"
          placeholder="Enter a descriptive name (optional, default: current date/time)"
          value={runName}
          onChange={e => setRunName(e.target.value)}
        />
        <div className="flex gap-2">
          <button
            className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 flex-1"
            onClick={handleSave}
          >
            Save
          </button>
          <button
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold flex-1"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
} 