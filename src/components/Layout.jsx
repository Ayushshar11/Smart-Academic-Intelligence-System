import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        {/* Top Navbar Area */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Welcome back, Prem!</h1>
            <p className="text-slate-500 text-sm">Here's what's happening with your academics today.</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              PS
            </div>
          </div>
        </header>

        {/* Page Content Rendered Here */}
        {children}
      </main>
    </div>
  );
};

export default Layout;