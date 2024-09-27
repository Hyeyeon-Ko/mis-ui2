import { useState } from 'react';
import { applicationData, sealRegistrationData, sealSelectionData } from '../datas/sealDatas';
import axios from 'axios';

export const useSealForm = (initialReadOnly = false) => {
    const [applications, setApplications] = useState([]);
    const [selectedDocumentDetails, setSelectedDocumentDetails] = useState(null);
    const [sealSelections, setSealSelections] = useState(sealSelectionData);
    const [file] = useState(null);
    const [readOnly] = useState(initialReadOnly);
    const [applicationDetails, setApplicationDetails] = useState(applicationData);
    const [sealDetails, setSealDetails] = useState(sealRegistrationData);
    const [isFileDeleted, setIsFileDeleted] = useState(false);
    const [selectedCenter, setSelectedCenter] = useState('all'); 
    const [filteredApplications, setFilteredApplications] = useState([]);

    const handleSealChange = (sealName) => {
        if (!readOnly) {
            setSealSelections(prevState => ({
                ...prevState,
                [sealName]: {
                    ...prevState[sealName],
                    selected: !prevState[sealName].selected,
                    quantity: ''
                }
            }));
        }
    };

    const handleQuantityChange = (e, sealName) => {
        const value = e.target.value;
        if (!readOnly) {
            setSealSelections(prevState => ({
                ...prevState,
                [sealName]: {
                    ...prevState[sealName],
                    quantity: value
                }
            }));
        }
    };

    const handleFileChange = (e) => {
        if (!readOnly) {
            setApplicationDetails(prevState => ({
                ...prevState,
                file: e.target.files[0],
                fileName: e.target.files[0]?.name || '',
                isFileDeleted: false,
            }));
        }
    };

    const handleChange = (e) => {
        if (!readOnly) {
            setApplicationDetails({
                ...applicationDetails,
                [e.target.name]: e.target.value,
            });
        }
    };

     // 신청서 데이터를 위한 handleChange
     const handleApplicationChange = (e) => {
        const { name, value } = e.target;
        if (!readOnly) {
            setApplicationDetails((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleApplicationFileChange = (e) => {
        if (!readOnly) {
            setApplicationDetails((prev) => ({
                ...prev,
                file: e.target.files[0],
                fileName: e.target.files[0]?.name || '',
                isFileDeleted: false,
            }));
        }
    };

    // 정보 수정 핸들러
    const handleUpdateChange = (e) => {
        const { name, value } = e.target;
        setSealDetails((prev) => ({
          ...prev,
          [name]: value,
        }));
      };
    
      const handleFileUpdateChange = (e) => {
        setSealDetails((prev) => ({
          ...prev,
          sealImage: e.target.files[0],
        }));
        setIsFileDeleted(false);  
      };

      const handleCenterChange = async (e) => {
        const selectedCenter = e.target.value;
        setSelectedCenter(selectedCenter);
    
        if (selectedCenter === 'all') {
          try {
            const response = await axios.get(`/api/seal/totalRegistrationList`);
            setFilteredApplications(response.data.data);
          } catch (error) {
            console.error('Error fetching total registration list:', error);
            alert('데이터를 불러오는 중 오류가 발생했습니다.');
          }
        } else {
          try {
            const response = await axios.get(`/api/seal/registrationList?instCd=${selectedCenter}`);
            setFilteredApplications(response.data.data);
          } catch (error) {
            console.error('Error fetching center registration list:', error);
            alert('데이터를 불러오는 중 오류가 발생했습니다.');
          }
        }
      };  

    return {
        sealSelections,
        applications,
        applicationDetails,
        selectedDocumentDetails,
        sealDetails,
        isFileDeleted,
        selectedCenter,
        filteredApplications,

        file,
        readOnly,

        setSealSelections,
        setApplicationDetails,
        setApplications,
        setSelectedDocumentDetails,
        setSealDetails,
        setIsFileDeleted,
        setSelectedCenter,
        setFilteredApplications,

        handleSealChange,
        handleQuantityChange,
        handleFileChange,
        handleChange,
        handleApplicationChange,
        handleApplicationFileChange,
        handleUpdateChange,
        handleFileUpdateChange,
        handleCenterChange,
    };
};