import React, { useState } from 'react';

export default function ManualEntry({ employees, onSubmit, loading }) {
  const [employeeId, setEmployeeId] = useState('');
  const [amount, setAmount] = useState('');
  const [remark, setRemark] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [search, setSearch] = useState('');

  const filteredEmployees = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.employee_id.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = e => {
    e.preventDefault();
    if (!employeeId || !amount) return;
    onSubmit({ employee: employeeId, amount, remark, attachment });
  };

  return (
    <form className="max-w-xl mx-auto bg-white rounded-lg shadow p-8 mt-10 flex flex-col gap-6" onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold mb-2">Manual Incentive Entry</h2>
      <div>
        <label className="block mb-1 font-medium">Employee</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2 mb-2"
          placeholder="Search employee by name or ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="w-full border rounded px-3 py-2"
          value={employeeId}
          onChange={e => setEmployeeId(e.target.value)}
        >
          <option value="">Select employee</option>
          {filteredEmployees.map(e => (
            <option key={e.id} value={e.id}>{e.name} ({e.employee_id})</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block mb-1 font-medium">Amount</label>
        <input
          type="number"
          className="w-full border rounded px-3 py-2"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Remark</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2"
          value={remark}
          onChange={e => setRemark(e.target.value)}
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Attachment (optional)</label>
        <input
          type="file"
          className="w-full"
          onChange={e => setAttachment(e.target.files[0])}
        />
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Submitting...' : 'Add Incentive'}
      </button>
    </form>
  );
} 