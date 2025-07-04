import React from 'react';

export default function History({ runs, onExpand, expandedRunId, onDelete }) {
  return (
    <div className="max-w-3xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-6">Payroll History</h2>
      {runs.length === 0 ? (
        <div className="text-gray-400 text-center">No archived payroll runs yet.</div>
      ) : (
        <div className="space-y-4">
          {runs.map(run => (
            <div key={run.id} className="bg-white rounded-lg shadow">
              <div className="flex justify-between items-center p-4 cursor-pointer" onClick={() => onExpand(run)}>
                <div>
                  <div className="font-semibold text-lg">{run.run_name}</div>
                  <div className="text-gray-500 text-sm">{new Date(run.run_timestamp).toLocaleString()}</div>
                </div>
                <button
                  className="bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200"
                  onClick={e => { e.stopPropagation(); if(window.confirm('Delete this payroll run?')) onDelete(run); }}
                >Delete</button>
              </div>
              {expandedRunId === run.id && (
                <div className="border-t p-4">
                  {/* Placeholder for details table, to be filled with run.results */}
                  {run.results && run.results.length > 0 ? (
                    <table className="min-w-full text-left">
                      <thead>
                        <tr>
                          <th className="py-2 px-4">Employee</th>
                          <th className="py-2 px-4">Final Salary</th>
                          <th className="py-2 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {run.results.map(r => (
                          <tr key={r.id} className="border-t">
                            <td className="py-2 px-4">{r.employee?.name}</td>
                            <td className="py-2 px-4">${r.final_salary}</td>
                            <td className="py-2 px-4">{r.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : <div className="text-gray-400">No results for this run.</div>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 