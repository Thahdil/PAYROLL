import React, { useState } from 'react';

export default function IconCard({ icon, title, onUpload, accept, cardWidth, loading, uploadStatus, multiple }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const handleChange = e => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    onUpload(multiple ? files : files.slice(0, 1));
  };

  return (
    <div className={`flex flex-col justify-between items-center bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl shadow-xl p-10 min-h-[320px] ${cardWidth || 'w-72'} transition-transform duration-300 hover:scale-105 hover:shadow-2xl`}>
      <div className="flex flex-col items-center w-full flex-1">
        <div className="mb-4 text-blue-600 animate-bounce-slow" style={{ fontSize: 48 }}>{icon}</div>
        <div className="font-bold mb-4 text-xl text-center text-blue-900 drop-shadow">{title}</div>
        {selectedFiles.length > 0 && (
          <div className="mt-2 w-full flex flex-col items-center">
            <div className="text-xs text-gray-600 mb-1">Selected file{multiple && selectedFiles.length > 1 ? 's' : ''}:</div>
            <ul className="text-xs bg-white/80 rounded p-2 w-full max-h-20 overflow-y-auto border border-gray-200">
              {selectedFiles.map(f => (
                <li key={f.name} className="truncate text-gray-800">{f.name}</li>
              ))}
            </ul>
          </div>
        )}
        {/* Upload status feedback */}
        {multiple ? (
          <div className="mt-4 min-h-[28px] flex flex-col items-center w-full">
            {uploadStatus && typeof uploadStatus === 'object' && Object.keys(uploadStatus).length > 0 && (
              Object.entries(uploadStatus).map(([fname, status]) => (
                <div key={fname} className="flex items-center text-sm w-full justify-center">
                  <span className="truncate max-w-[120px] mr-2">{fname}</span>
                  {status === 'uploading' && (
                    <svg className="animate-spin h-5 w-5 text-blue-600 mr-1" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                  )}
                  {status === 'success' && (
                    <svg className="h-5 w-5 text-green-600 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  )}
                  <span className={status === 'success' ? 'text-green-600' : 'text-blue-600'}>{status === 'success' ? 'Uploaded!' : 'Uploading...'}</span>
                </div>
              ))
            )}
          </div>
        ) : (
          (loading || uploadStatus) && (
            <div className="mt-4 min-h-[28px] flex items-center justify-center">
              {loading && (
                <svg className="animate-spin h-6 w-6 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
              )}
              {uploadStatus === 'success' && (
                <span className="flex items-center text-green-600 font-semibold">
                  <svg className="h-6 w-6 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Uploaded!
                </span>
              )}
            </div>
          )
        )}
      </div>
      <div className="w-full flex justify-center mt-6">
        <label className="bg-blue-600 text-white px-8 py-3 rounded-xl cursor-pointer hover:bg-blue-700 text-lg font-semibold transition-all duration-200 shadow hover:shadow-lg hover:-translate-y-1 w-full text-center">
          <input type="file" accept={accept} className="hidden" onChange={handleChange} disabled={loading} multiple={multiple} />
          {loading ? 'Uploading...' : 'Upload'}
        </label>
      </div>
    </div>
  );
} 