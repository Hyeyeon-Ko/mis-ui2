import { useState } from "react";
import { addFormData } from "../datas/tonerData";

const useTonerChange = () => {
    const [selectedRows, setSelectedRows] = useState([]); 
    const [activeTab, setActiveTab] = useState('text');
    const [file, setFile] = useState(null);
    const [formData, setFormData] = useState(addFormData);

    const divisionMap = {
        드럼: 'A',
        번들: 'B',
        유지보수키트: 'C',
        잉크: 'D',
        토너: 'E',
    };

    const reverseDivisionMap = Object.fromEntries(
        Object.entries(divisionMap).map(([key, value]) => [value, key])
    );

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