import React from 'react';
import { MoreVertical, ExternalLink } from 'lucide-react';

const students = [
  { id: "2024001", name: "Amit Singh", attendance: "92%", prediction: "8.8", risk: "Low" },
  { id: "2024005", name: "Rahul Verma", attendance: "64%", prediction: "5.2", risk: "High" },
  { id: "2024012", name: "Sneha Kapoor", attendance: "78%", prediction: "7.1", risk: "Medium" },
  { id: "2024021", name: "Priya Das", attendance: "85%", prediction: "8.0", risk: "Low" },
  { id: "2024045", name: "Vikas Raj", attendance: "55%", prediction: "4.8", risk: "High" },
];

const StudentRiskTable = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800">Student Performance Monitoring</h3>
        <button className="text-sm text-blue-600 font-medium hover:underline">View All</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4">Student ID</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Attendance</th>
              <th className="px-6 py-4">Predicted GPA</th>
              <th className="px-6 py-4">Risk Level</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-slate-700">{student.id}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{student.name}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{student.attendance}</td>
                <td className="px-6 py-4 text-sm font-bold text-blue-600">{student.prediction}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    student.risk === 'High' ? 'bg-red-100 text-red-600' : 
                    student.risk === 'Medium' ? 'bg-yellow-100 text-yellow-600' : 
                    'bg-green-100 text-green-600'
                  }`}>
                    {student.risk}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-slate-400 hover:text-slate-600">
                    <ExternalLink size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentRiskTable;