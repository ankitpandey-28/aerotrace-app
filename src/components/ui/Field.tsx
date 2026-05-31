import React from 'react';

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Field({ label, value, type = 'text', className = '', ...props }: FieldProps) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block mb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[#A0A8B8]">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        className="w-full rounded-[28px] border border-white/10 bg-[#161A22] px-4 py-3 text-sm text-white placeholder-[#A0A8B8] shadow-[0_12px_40px_-24px_rgba(0,0,0,0.85)] transition-all duration-200 focus:border-[#4F8CFF]/20 focus:outline-none focus:ring-2 focus:ring-[#4F8CFF]/20"
        {...props}
      />
    </div>
  );
}
export default Field;
