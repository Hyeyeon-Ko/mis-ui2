import { useState } from "react";
import { inputValue } from "../datas/corpDocDatas";

const useCorpChange = () => {
  const [formData, setFormData] = useState(inputValue);
  const [existingFile, setExistingFile] = useState(null);
  const [file, setFile] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox" && !checked) {
      const quantityField = `quantity${name.slice(-1)}`;
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: checked,
        [quantityField]: "",
      }));
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleFileChange = (e) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      department: e.target.files[0],
    }));
  };

  const handleDetailFileChange = (e) => {
    setFile(e.target.files[0]);
    setExistingFile(null);
};

  const handleStoreChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  return {
    formData,
    existingFile,
    file,
    setFormData,
    setExistingFile,
    setFile,
    handleChange,
    handleFileChange,
    handleStoreChange,
    handleDetailFileChange,
  };
};

export default useCorpChange;
