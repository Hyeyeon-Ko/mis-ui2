import React from 'react';
import PropTypes from 'prop-types';
import '../../styles/common/Table.css';

const Table = ({ columns, data, isToner = false, onRowClick = () => {}, onRowMouseDown = () => {}, onRowMouseOver = () => {}, onRowMouseUp = () => {} }) => (
  <table className="custom-table">
    <thead>
      <tr>
        {columns.map((col, index) => (
          <th key={index} style={{ width: col.width }}>{col.header}</th>
        ))}
      </tr>
    </thead>
    <tbody>
      {data.length === 0 ? (
        <tr>
          <td colSpan={columns.length} style={{ textAlign: 'center' }}>
          {isToner ? '신청할 항목을 추가해주세요.' : '조회된 데이터가 없습니다.'}
          </td>
        </tr>
      ) : (
        data.map((row, rowIndex) => {
          const isCancelled = row.status === '신청취소' || (row.type === 'B' && row.status === 'E');
          return (
            <tr
              key={rowIndex}
              className={isCancelled ? 'cancelled' : ''}
              onClick={() => onRowClick(row, rowIndex)}
              onMouseDown={() => onRowMouseDown(rowIndex)}
              onMouseOver={() => onRowMouseOver(rowIndex)}
              onMouseUp={onRowMouseUp}
            >
              {columns.map((col, colIndex) => (
                <td key={colIndex}>
                  {col.Cell ? (
                    <div className={`icon-cell ${isCancelled && (col.accessor === 'file' || col.accessor === 'delete') ? 'disabled' : ''}`}>
                      {col.Cell({ row: row.original || row })}
                    </div>
                  ) : (
                    row[col.accessor]
                  )}
                </td>
              ))}
            </tr>
          );
        })
      )}
    </tbody>
  </table>
);

Table.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  isToner: PropTypes.bool,
  onRowClick: PropTypes.func,
  onRowMouseDown: PropTypes.func,
  onRowMouseOver: PropTypes.func,
  onRowMouseUp: PropTypes.func,
};

export default Table;
