import React from 'react';

export default function WelcomePage({ onGetStarted }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-300">
      <div className="bg-white rounded-xl shadow-lg p-10 flex flex-col items-center">
        <h1 className="text-4xl font-bold mb-4 text-blue-700">Welcome to the Advanced Payroll Processing System</h1>
        <p className="mb-8 text-lg text-gray-700 text-center max-w-xl">
          Streamline your payroll workflow, ensure accuracy, and maintain a complete audit trail. Get started to upload data, calculate payrolls, and manage your payroll history with ease.
        </p>
        <button
          className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold text-lg shadow hover:bg-blue-700 transition"
          onClick={onGetStarted}
        >
          Get Started
        </button>
      </div>
    </div>
  );
} 