import React from 'react';
import { LayoutDashboard, User, BookOpen, BarChart3, Settings, LogOut } from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', active: true },
    { icon: <BookOpen size={20} />, label: 'Academics', active: false },
    { icon: <BarChart3 size={20} />, label: 'Analytics', active: false },
    { icon: <User size={20} />, label: 'Profile', active: false },
    { icon: <Settings size={20} />, label: 'Settings', active: false },
  ];

  return (
    <div className="h-screen w-64 bg-slate-900 text-white flex flex-col fixed left-0 top-0">
      <div className="p-6 text-2xl font-bold border-b border-slate-800">
        Smart<span className="text-blue-400">Academic</span>
      </div>
      
      <nav className="flex-1 mt-6 px-4 space-y-2">
        {menuItems.map((item, index) => (
          <div 
            key={index} 
            className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
              item.active ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button className="flex items-center space-x-3 text-slate-400 hover:text-red-400 w-full p-2">
          <LogOut size={20} />
          <span>Logout (Mock)</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;