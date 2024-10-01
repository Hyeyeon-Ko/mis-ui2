import { useState } from "react";

const useRentalChange = () => {
    const [selectedRows, setSelectedRows] = useState([]); 


    const handleRowSelect = (e, row, index) => {
        e.stopPropagation(); 
        const isChecked = e.target.checked;
        if (isChecked) {
            setSelectedRows(prevSelectedRows => [...prevSelectedRows, row.detailId]);
        } else {
            setSelectedRows(prevSelectedRows => prevSelectedRows.filter(id => id !== row.detailId));
        }
    };
    
    return { selectedRows, setSelectedRows, handleRowSelect}
}

export default useRentalChange