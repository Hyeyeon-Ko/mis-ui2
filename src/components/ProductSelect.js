import React from 'react';

function ProduceSelect({ categoryOptions, selectedCategory, onCategoryChange }) {
    return (
      <div className="status-header">
        제품군 <span className="arrow">▼</span>
        <select 
          value={selectedCategory} 
          onChange={onCategoryChange} 
          className="status-select"
        >
          {categoryOptions.map(category => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </div>
    );
}
  
export default ProduceSelect;
  