import React from 'react';

function CenterSelect({ centers, selectedCenter, onCenterChange }) {
  return (
    <div className="center-header">
      센터 <span className="arrow">▼</span>
      <select value={selectedCenter} onChange={onCenterChange} className="center-select">
        {centers.map(center => (
          <option key={center} value={center}>{center}</option>
        ))}
      </select>
    </div>
  );
}

export default CenterSelect;
