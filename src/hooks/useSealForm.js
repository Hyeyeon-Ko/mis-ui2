import { useContext, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../components/AuthContext';

export const useSealForm = (initialReadOnly = false, sealExportDetails = {}) => {
    const [sealSelections, setSealSelections] = useState({
        corporateSeal: { selected: false, quantity: '' },
        facsimileSeal: { selected: false, quantity: '' },
        companySeal: { selected: false, quantity: '' },
    });

    const [file, setFile] = useState(null);
    const [readOnly, setReadOnly] = useState(initialReadOnly);
    // const { sealExportDetails, readOnly: initialReadOnly } = location.state || {};
    // const [readOnly, setReadOnly] = useState(initialReadOnly ?? false);
    const [applicationDetails, setApplicationDetails] = useState({
        submission: '',
        useDept: '',
        expNm: '',
        expDate: '',
        returnDate: '',
        purpose: '',
        file: null,
        fileName: '',  
        filePath: '',  
        isFileDeleted: false,
    });
    const [showRejectModal, setShowRejectModal] = useState(false);
    const navigate = useNavigate();
    const { draftId } = useParams(); 
    const { auth, refreshSidebar } = useContext(AuthContext);

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

    const handleFileDelete = () => {
        if (!readOnly) {
            setApplicationDetails(prevState => ({
                ...prevState,
                file: null,
                fileName: '',
                filePath: '',
                isFileDeleted: true,
            }));
        }
    };

    const handleFileDownload = async () => {
        if (applicationDetails.fileName && applicationDetails.filePath) {
            try {
                const response = await axios.get(`/api/doc/download/${encodeURIComponent(applicationDetails.fileName)}`, {
                    responseType: 'blob',
                });

                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', applicationDetails.fileName);
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
            } catch (error) {
                console.error('Error downloading the file:', error);
                alert('파일 다운로드에 실패했습니다.');
            }
        }
    };

    const handleApproval = async (e) => {
        e.preventDefault();
        try {
          await axios.post(`/api/seal/${draftId}`);
          alert('인장 신청이 성공적으로 승인되었습니다.');
          await refreshSidebar();
          navigate('/pendingList?documentType=인장신청');
        } catch (error) {
          console.error('Error approving application:', error);
          alert('인장 신청 승인 중 오류가 발생했습니다.');
          navigate('/pendingList?documentType=인장신청');
        }
    };

    const handleReject = (e) => {
        e.preventDefault();
        setShowRejectModal(true);
    };
      
    const handleRejectClose = () => {
        setShowRejectModal(false);
    };  

    const handleRejectConfirm = async (reason) => {
        try {
          const response = await axios.post(`/api/seal/return/${draftId}`, reason, {
            headers: {
              'Content-Type': 'text/plain',
            },
          });
          if (response.data.code === 200) {
            alert('인장 신청이 반려되었습니다.');
            await refreshSidebar();
            navigate(`/pendingList?documentType=인장신청`);  
          } else {
            alert('인장 반려 중 오류가 발생했습니다.');
          }
        } catch (error) {
          alert('인장 반려 중 오류가 발생했습니다.');
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

    return {
        sealSelections,
        file,
        readOnly,
        applicationDetails,
        showRejectModal,
        auth,
        draftId,
        navigate,

        setSealSelections,
        setApplicationDetails,

        handleSealChange,
        handleQuantityChange,
        handleFileChange,
        handleFileDelete,
        handleFileDownload,

        handleApproval,
        handleReject,
        handleRejectClose,
        handleRejectConfirm,
        handleChange,
    };
};