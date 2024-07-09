import React from 'react';
import PropTypes from 'prop-types';
import '../../styles/common/Table.css';

/* 테이블 component */
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
      {data.map((row, rowIndex) => (
        <tr key={rowIndex}>
          {columns.map((col, colIndex) => (
            <td key={colIndex}>
              {col.Cell ? col.Cell({ row }) : row[col.accessor]}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);

Table.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default Table;
