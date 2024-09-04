import React from 'react';

function StatusSelect({ statusOptions, selectedStatus, onStatusChange }) {
  return (
    <div className="status-header">
      상태 <span className="arrow">▼</span>
      <select value={selectedStatus} onChange={onStatusChange} className="status-select">
        {statusOptions.map(status => (
          <option key={status.value} value={status.value}>{status.label}</option>
        ))}
      </select>
    </div>
  );
}

export default StatusSelect;
