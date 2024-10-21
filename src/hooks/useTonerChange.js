import { useState } from "react";
import { addFormData, reverseDivisionMap } from "../datas/tonerData";

const useTonerChange = () => {
    const [selectedRows, setSelectedRows] = useState([]); 
    const [activeTab, setActiveTab] = useState('text');
    const [file, setFile] = useState(null);
    const [formData, setFormData] = useState(addFormData);

    const handleRowSelect = (e, row, index) => {
        e.stopPropagation(); 
        const isChecked = e.target.checked;
        if (isChecked) {
            setSelectedRows(prevSelectedRows => [...prevSelectedRows, row.detailId]);
        } else {
            setSelectedRows(prevSelectedRows => prevSelectedRows.filter(id => id !== row.detailId));
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
    
        const updatedValue = name === 'division' ? value : value; 
    
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: updatedValue, 
        }));
    };
    
    const setFormDataWithDivision = (data) => {
        setFormData({
            ...data,
            division: reverseDivisionMap[data.division] || data.division,
        });
    };
    
    return { formData, file, selectedRows, activeTab, setFormData: setFormDataWithDivision, setFile, setActiveTab, setSelectedRows, handleRowSelect, handleTabChange, handleFileChange, handleChange}
}

export default useTonerChange