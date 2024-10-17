import { useState } from "react";
import { addFormData } from "../datas/rentalDatas";

const useTonerChange = () => {
    const [selectedRows, setSelectedRows] = useState([]); 
    const [activeTab, setActiveTab] = useState('file');
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
        setFormData({
            ...formData,
            [name]: value,
        });
    };
    

    return { formData, file, selectedRows, activeTab, setFormData, setFile, setActiveTab, setSelectedRows, handleRowSelect, handleTabChange, handleFileChange, handleChange}
}

export default useTonerChange