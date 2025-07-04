import React from 'react';

export default function DetailsModal({ open, onClose, details, onOpenFile }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 min-w-[400px] relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={onClose}>&times;</button>
        <h3 className="text-xl font-bold mb-4">Component Breakdown</h3>
        <table className="min-w-full text-left mb-4">
          <thead>
            <tr>
              <th className="py-2 px-4">Type</th>
              <th className="py-2 px-4">Amount</th>
              <th className="py-2 px-4">Reason</th>
              <th className="py-2 px-4">Source File</th>
            </tr>
          </thead>
          <tbody>
            {details && details.length > 0 ? details.map((d, i) => (
              <tr key={i} className="border-t">
                <td className="py-2 px-4">{d.type}</td>
                <td className="py-2 px-4">${d.amount}</td>
                <td className="py-2 px-4">{d.remark || '-'}</td>
                <td className="py-2 px-4">
                  <button className="text-blue-600 underline" onClick={() => onOpenFile(d.source_file)}>{d.source_file}</button>
                </td>
              </tr>
            )) : <tr><td colSpan={4} className="text-center py-4 text-gray-400">No details available.</td></tr>}
          </tbody>
        </table>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 w-full" onClick={onClose}>Close</button>
      </div>
    </div>
  );
} 