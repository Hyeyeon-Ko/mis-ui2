import React from 'react';

function StatusFilters({ filters, onFilterChange }) {
  return (
    <div className="status-filters">
      <label>
        <input
          type="checkbox"
          name="statusApproved"
          checked={filters.statusApproved}
          onChange={onFilterChange}
        />
        승인완료
      </label>
      <label>
        <input
          type="checkbox"
          name="statusRejected"
          checked={filters.statusRejected}
          onChange={onFilterChange}
        />
        반려
      </label>
      <label>
        <input
          type="checkbox"
          name="statusOrdered"
          checked={filters.statusOrdered}
          onChange={onFilterChange}
        />
        발주완료
      </label>
      <label>
        <input
          type="checkbox"
          name="statusClosed"
          checked={filters.statusClosed}
          onChange={onFilterChange}
        />
        처리완료
      </label>
    </div>
  );
}

export default StatusFilters;
