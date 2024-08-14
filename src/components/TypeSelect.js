import React from 'react';

function TypeSelect({ types, selectedType, onTypeChange }) {
  return (
    <div className="type-header">
      분류 <span className="arrow">▼</span>
      <select value={selectedType} onChange={onTypeChange} className="type-select">
        {types.map(type => (
          <option key={type} value={type}>{type}</option>
        ))}
      </select>
    </div>
  );
}

export default TypeSelect;
