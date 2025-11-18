import React from 'react';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'outline' }> = ({ 
  children, variant = 'primary', className = '', ...props 
}) => {
  const baseStyles = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm",
    secondary: "bg-white text-indigo-600 border border-indigo-100 hover:bg-indigo-50 shadow-sm",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100",
    outline: "border-2 border-slate-200 text-slate-600 hover:border-indigo-500 hover:text-indigo-500"
  };
  
  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string; title?: string }> = ({ children, className = "", title }) => (
  <div className={`bg-white p-6 rounded-xl shadow-sm border border-slate-100 ${className}`}>
    {title && <h3 className="text-lg font-semibold text-slate-800 mb-4">{title}</h3>}
    {children}
  </div>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({ label, className = '', ...props }) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>}
    <input 
      className={`w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all ${className}`} 
      {...props} 
    />
  </div>
);

export const Badge: React.FC<{ children: React.ReactNode; color?: 'green' | 'red' | 'blue' | 'yellow' }> = ({ children, color = 'blue' }) => {
    const colors = {
        green: "bg-green-100 text-green-800",
        red: "bg-red-100 text-red-800",
        blue: "bg-blue-100 text-blue-800",
        yellow: "bg-yellow-100 text-yellow-800"
    }
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[color]}`}>
            {children}
        </span>
    )
}