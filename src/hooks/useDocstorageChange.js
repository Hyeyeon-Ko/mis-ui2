import { useState } from "react";
import { dockStorageFormData } from "../datas/dockstorageDatas";

const useDocstorageChange = () => {
    const [selectedType, setSelectedType] = useState('전체'); 
    const [selectedStatus, setSelectedStatus] = useState('전체');  
    const [selectedRows, setSelectedRows] = useState([]);
    const [formData, setFormData] = useState(dockStorageFormData);
    const [activeTab, setActiveTab] = useState('file');
    const [file, setFile] = useState(null);



    const handleTypeChange = (event) => {
        setSelectedType(event.target.value);
    };  

    const handleStatusChange = (event) => {  
        setSelectedStatus(event.target.value);
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

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };
    
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
    };
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };
    

    return {selectedStatus, selectedType,selectedRows, activeTab, formData, file,
        setSelectedStatus, setSelectedRows, setFormData, setFile, setActiveTab,
        handleTypeChange, handleStatusChange, handleRowSelect, handleTabChange, handleFileChange, handleChange}
}

export default useDocstorageChange