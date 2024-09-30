import { useState } from "react";

const useDocstorageChange = () => {
    const [selectedType, setSelectedType] = useState('전체'); 
    const [selectedRows, setSelectedRows] = useState([]);


    const handleTypeChange = (event) => {
        setSelectedType(event.target.value);
    };  

    const handleStatusChange = (event) => {  
        setSelectedType(event.target.value);
      };
    
      const handleRowSelect = (e, row, index) => {
        if (typeof e.stopPropagation === 'function') {
          e.stopPropagation(); 
        }
        const isChecked = e.target.checked;
        if (isChecked) {
          setSelectedRows(prevSelectedRows => [...prevSelectedRows, row.detailId]);
        } else {
          setSelectedRows(prevSelectedRows => prevSelectedRows.filter(id => id !== row.detailId));
        }
      };

  return {selectedType,selectedRows,  handleTypeChange, handleStatusChange, handleRowSelect}
}

export default useDocstorageChange