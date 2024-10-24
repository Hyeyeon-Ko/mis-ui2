import { useState } from "react";
import { addFormData, reverseDivisionMap } from "../datas/tonerData";

const useTonerChange = () => {
    const [selectedRows, setSelectedRows] = useState([]); 
    const [activeTab, setActiveTab] = useState('text');
    const [file, setFile] = useState(null);
    const [formData, setFormData] = useState(addFormData);
    const [applications, setApplications] = useState([]);
    const [selectedApplications, setSelectedApplications] = useState([]);
  
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

    // 전체 선택/해제 핸들러
    const handleSelectAll = (e) => {
        const isChecked = e.target.checked;
        
        if (isChecked) {
          const allDraftIds = applications.map(row => row.draftId);
          setSelectedApplications(allDraftIds);
        } else {
          setSelectedApplications([]);
        }
      };
      

    // 개별 선택/해제 핸들러
    // const handleSelect = (event, id) => {
    //     if (event.target.checked) {
    //     setSelectedApplications([...selectedApplications, id]);
    //     } else {
    //     setSelectedApplications(
    //         selectedApplications.filter((appId) => appId !== id)
    //     );
    //     }
    // };

    const handleSelect = (event, id) => {
        if (event.target.checked) {
          const updatedSelected = [...selectedApplications, id];
    
          if (updatedSelected.length === applications.length) {
            document.getElementById('select-all-checkbox').checked = true; 
          }
    
          setSelectedApplications(updatedSelected);
        } else {
          const updatedSelected = selectedApplications.filter((appId) => appId !== id);
    
          document.getElementById('select-all-checkbox').checked = false;
    
          setSelectedApplications(updatedSelected);
        }
      };
    

    return { 
        formData, 
        file, 
        selectedRows, 
        activeTab, 
        setFormData: setFormDataWithDivision, 
        setFile, 
        setActiveTab, 
        setSelectedRows, 
        handleRowSelect, 
        handleTabChange, 
        handleFileChange, 
        handleChange,
        handleSelectAll,
        handleSelect,
        applications,
        selectedApplications,    
        setApplications,
        setSelectedApplications,

    }
}

export default useTonerChange