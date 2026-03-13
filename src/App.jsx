import React, { useState } from 'react';
import Layout from './components/Layout';
import PredictionCard from './components/PredictionCard';
import PerformanceChart from './components/PerformanceChart';
import AIInsights from './components/AIInsights';
import StudentRiskTable from './components/StudentRiskTable';
import AdminAnalytics from './components/AdminAnalytics';

function App() {
  // Use state to switch views manually for now
  const [role, setRole] = useState('student'); 

  return (
    <Layout>
      {/* Temporary Role Switcher (Mocking the Auth logic) */}
      <div className="mb-6 flex space-x-4 bg-slate-200 p-1 w-fit rounded-lg">
        {['student', 'faculty', 'admin'].map((r) => (
          <button
            key={r}
            onClick={() => setRole(r)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${
              role === r ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {role === 'student' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <PredictionCard type="Dropout Risk" score="12%" status="Low" />
            <PredictionCard type="Final Sem GPA (Predicted)" score="8.4" status="Success" />
            <PredictionCard type="Attendance Anomaly" score="Normal" status="Success" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2"> <PerformanceChart /> </div>
            <div> <AIInsights /> </div>
          </div>
        </>
      )}

      {role === 'faculty' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PredictionCard type="At-Risk Students" score="05" status="High" />
            <PredictionCard type="Class Avg. Attendance" score="78%" status="Medium" />
            <PredictionCard type="Pending Evaluations" score="12" status="Low" />
          </div>
          <StudentRiskTable />
        </div>
      )}

      {role === 'admin' && (
  <div className="space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <p className="text-slate-500 text-xs font-bold uppercase">Total Students</p>
        <p className="text-2xl font-bold text-slate-800">1,240</p>
      </div>
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <p className="text-slate-500 text-xs font-bold uppercase">Total Faculty</p>
        <p className="text-2xl font-bold text-slate-800">85</p>
      </div>
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <p className="text-slate-500 text-xs font-bold uppercase">Overall GPA</p>
        <p className="text-2xl font-bold text-blue-600">7.42</p>
      </div>
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <p className="text-slate-500 text-xs font-bold uppercase">Dropout Risk</p>
        <p className="text-2xl font-bold text-red-500">4.2%</p>
      </div>
    </div>
    <AdminAnalytics />
  </div>
)}
    </Layout>
  );
}

export default App;