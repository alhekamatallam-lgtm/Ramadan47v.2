
import React from 'react';

interface InputGroupProps {
  title: string;
  icon?: string;
  children: React.ReactNode;
}

const InputGroup: React.FC<InputGroupProps> = ({ title, icon, children }) => {
  return (
    <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 p-8 sm:p-10 relative overflow-hidden">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-[#0054A6]/5 rounded-2xl flex items-center justify-center text-2xl">
          {icon}
        </div>
        <h3 className="text-xl font-black text-[#003366]">{title}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {children}
      </div>
    </div>
  );
};

export default InputGroup;
