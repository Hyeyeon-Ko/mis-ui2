import React from 'react';

function CustomSelect({ label, options, selectedValue, onChangeHandler }) {
  return (
    <div className="status-header">
      {label} <span className="arrow">▼</span>
      <select value={selectedValue} onChange={onChangeHandler} className="status-select">
        {options.map(option => (
          <option key={option.value || option} value={option.value || option}>
            {option.label || option}
          </option>
        ))}
      </select>
    </div>
  );
}

export default CustomSelect;
