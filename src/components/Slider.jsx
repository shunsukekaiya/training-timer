import React from 'react';

export const Slider = ({ 
  label, 
  value, 
  min = 0, 
  max = 100, 
  step = 1, 
  onChange, 
  formatValue 
}) => {
  return (
    <div className="flex-col gap-4" style={{ width: '100%' }}>
      <div className="flex-center" style={{ justifyContent: 'space-between' }}>
        <span className="text-subtitle">{label}</span>
        <span className="text-subtitle" style={{ fontWeight: 600, color: 'var(--text-main)' }}>
          {formatValue ? formatValue(value) : value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
};
