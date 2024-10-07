import { useState } from "react";
import { docFormData } from "../datas/docDatas";

const useDocChange = () => {
  const [formData, setFormData] = useState(docFormData);
  const [file, setFile] = useState(null);
  const [existingFile, setExistingFile] = useState(null);
  const [attachment, setAttachment] = useState(null);  // 첨부파일
  const [selectedRows, setSelectedRows] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setExistingFile(null);
  };

  const handleFileDelete = () => {
    setFile(null);
    setExistingFile(null);
  };

  const handleApplyFileChange = (e) => {
    setAttachment(e.target.files[0]);
  };

  const handleSelectRow = (isChecked, draftId) => {
    if (isChecked) {
      setSelectedRows(prevSelected => [...prevSelected, draftId]);
    } else {
      setSelectedRows(prevSelected => prevSelected.filter(id => id !== draftId));
    }
  };

  const handleSelectAll = (isChecked) => {
    if (isChecked) {
      const allDraftIds = filteredApplications.map(app => app.draftId);
      setSelectedRows(allDraftIds);
    } else {
      setSelectedRows([]);
    }
  };

  return {
    attachment,
    formData,
    file,
    existingFile,
    selectedRows,
    setAttachment,
    setFormData,
    setFile,
    setExistingFile,
    setSelectedRows,
    setFilteredApplications,
    handleChange,
    handleFileChange,
    handleFileDelete,
    handleApplyFileChange,
    handleSelectRow,
    handleSelectAll,
  };
};

export default useDocChange;
