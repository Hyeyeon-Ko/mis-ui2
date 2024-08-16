import React from 'react';
import PropTypes from 'prop-types';
import '../../styles/common/Table.css';

const Table = ({ columns, data }) => (
  <table className="custom-table">
    <thead>
      <tr>
        {columns.map((col, index) => (
          <th key={index} style={{ width: col.width }}>{col.header}</th>
        ))}
      </tr>
    </thead>
    <tbody>
      {data.map((row, rowIndex) => {
        const isCancelled = row.status === '신청취소' || (row.type === 'B' && row.status === 'E');
        return (
          <tr key={rowIndex} className={isCancelled ? 'cancelled' : ''}>
            {columns.map((col, colIndex) => (
              <td key={colIndex}>
                {col.Cell ? (
                  <div className={`icon-cell ${row.status === '신청취소' ? 'disabled' : ''}`}>
                    {col.Cell({ row: row.original || row })}
                  </div>
                ) : (
                  row[col.accessor]
                )}
              </td>
            ))}
          </tr>
        );
      })}
    </tbody>
  </table>
);

Table.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default Table;
