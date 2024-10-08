import { useState, useContext, useEffect } from 'react';
import { applicationData, sealRegistrationData, sealSelectionData } from '../datas/sealDatas';
import axios from 'axios';
import { AuthContext } from '../components/AuthContext'; // 추가: AuthContext 사용

export const useSealForm = (initialReadOnly = false) => {
    const { auth } = useContext(AuthContext); // 추가: auth 정보 사용
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
    const [formData, setFormData] = useState(sealRegistrationData);

    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; 

    const fetchTotalRegistrationList = async (pageIndex = 1, pageSize = itemsPerPage) => {
        try {
            const response = await axios.get(`/api/seal/totalRegistrationList2`, {
                params: {
                    pageIndex,
                    pageSize,
                },
            });

            const data = response.data.data;
            const totalPages = data.totalPages;
            const currentPage = data.number + 1;

            setFilteredApplications(data.content);
            setTotalPages(totalPages);  
            setCurrentPage(currentPage);  

        } catch (error) {
            console.error('Error fetching total registration list:', error);
            alert('데이터를 불러오는 중 오류가 발생했습니다.');
        }
    };

    const handleCenterChange = async (e) => {
        const selectedCenter = e.target.value;
        setSelectedCenter(selectedCenter);
        setCurrentPage(1);  

        if (selectedCenter === 'all') {
            await fetchTotalRegistrationList(1, itemsPerPage);  
        } else {
            try {
                const response = await axios.get(`/api/seal/registrationList2`, {
                    params: {
                        instCd: selectedCenter,  
                        pageIndex: 1,
                        pageSize: itemsPerPage,
                    },
                });
                setFilteredApplications(response.data.data.content);  
                setTotalPages(response.data.data.totalPages);
            } catch (error) {
                console.error('Error fetching center registration list:', error);
                alert('데이터를 불러오는 중 오류가 발생했습니다.');
            }
        }
    };

    // 페이지 변경 시 호출
    const handlePageClick = (selectedPage) => {
        const pageIndex = selectedPage.selected + 1;
        setCurrentPage(pageIndex);
        if (selectedCenter === 'all') {
            fetchTotalRegistrationList(pageIndex, itemsPerPage);
        } else {
            handleCenterChange({ target: { value: selectedCenter } });  
        }
    };

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

    const handleAddModalChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleAddModalFileChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            sealImage: e.target.files[0],
        }));
    };

    useEffect(() => {
      fetchTotalRegistrationList();   
    }, []);  

    return {
        sealSelections,
        applications,
        applicationDetails,
        selectedDocumentDetails,
        sealDetails,
        isFileDeleted,
        selectedCenter,
        filteredApplications,
        formData,
        totalPages,
        currentPage,
        itemsPerPage,

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
        setFormData,

        handleSealChange,
        handleQuantityChange,
        handleFileChange,
        handleChange,
        handleCenterChange,
        handlePageClick,
        handleAddModalChange,
        handleAddModalFileChange,
    };
};
