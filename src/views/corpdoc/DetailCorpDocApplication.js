import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../components/AuthContext';
import { validateForm } from '../../hooks/validateForm';
import { getTypeName } from '../../hooks/fieldNameUtils';
import Breadcrumb from '../../components/common/Breadcrumb';
import CustomButton from '../../components/common/CustomButton';
import ReasonModal from '../../components/ReasonModal';
import axios from 'axios';
import '../../styles/common/Page.css';
import '../../styles/corpdoc/CorpDocApply.css';
import downloadIcon from '../../assets/images/download.png';
import deleteIcon from '../../assets/images/delete2.png'; 



function DetailCorpDocApplication() {
    const { draftId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const applyStatus = queryParams.get('applyStatus'); 
    const { auth, refreshSidebar } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        submission: '',
        purpose: '',
        useDate: '',
        department: null,
        document1: false,
        document2: false,
        document3: false,
        document4: false,
        quantity1: '',
        quantity2: '',
        quantity3: '',
        quantity4: '',
        type: '',
        notes: '',
    });
    const [initialData, setInitialData] = useState(null);
    const [existingFile, setExistingFile] = useState(null);
    const [file, setFile] = useState(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const isReadOnly = new URLSearchParams(location.search).get('readonly') === 'true';
    const [showDownloadReasonModal, setShowDownloadReasonModal] = useState(false);

    const fetchCorpDocDetail = useCallback(async (id) => {
        try {
            const response = await axios.get(`/api/corpDoc/${id}`);
            if (response.data && response.data.data) {
                const {
                    submission,
                    purpose,
                    useDate,
                    certCorpseal,
                    certCoregister,
                    certUsesignet,
                    warrant,
                    type,
                    notes,
                    fileName,
                    filePath
                } = response.data.data;

                const fetchedData = {
                    submission: submission || '',
                    purpose: purpose || '',
                    useDate: useDate || '',
                    document1: certCorpseal > 0,
                    document2: certCoregister > 0,
                    document3: certUsesignet > 0,
                    document4: warrant > 0,
                    quantity1: certCorpseal > 0 ? certCorpseal.toString() : '',
                    quantity2: certCoregister > 0 ? certCoregister.toString() : '',
                    quantity3: certUsesignet > 0 ? certUsesignet.toString() : '',
                    quantity4: warrant > 0 ? warrant.toString() : '',
                    type: type === 'O' ? 'original': type === 'P' ? 'pdf' : 'both',
                    notes: notes || '',
                };

                setFormData(fetchedData);
                setInitialData(fetchedData);
                setExistingFile(fileName && filePath ? { name: fileName, path: filePath } : null);
            }
        } catch (error) {
            console.error('Error fetching corporate document details:', error);
        }
    }, []);

    useEffect(() => {
        if (draftId) {
            fetchCorpDocDetail(draftId);
        }
    }, [draftId, fetchCorpDocDetail]);
    
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (type === 'checkbox' && !checked) {
            const quantityField = `quantity${name.slice(-1)}`;
            setFormData((prevFormData) => ({
                ...prevFormData,
                [name]: checked,
                [quantityField]: '',
            }));
        } else {
            setFormData((prevFormData) => ({
                ...prevFormData,
                [name]: type === 'checkbox' ? checked : value,
            }));
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setExistingFile(null);
    };

    const handleFileDelete = () => {
        setFile(null);
        setExistingFile(null);
    };

    const handleFileDownloadClick = () => {
        setShowDownloadReasonModal(true); 
    };

    const handleDownloadModalClose = () => {
        setShowDownloadReasonModal(false); 
    };
        
    const handleFileDownloadConfirm = async ({ reason, fileType }) => {
        setShowDownloadReasonModal(false);
    
        try {
            const response = await axios.get(`/api/file/download/${encodeURIComponent(existingFile.name)}`, {
                params: {
                    draftId: draftId,
                    docType: 'corpdoc',
                    fileType: fileType,
                    reason: reason,
                    downloaderNm: auth.hngNm,
                    downloaderId: auth.userId,
                },
                responseType: 'blob',
            });
    
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', existingFile.name);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error('Error downloading the file:', error);
            alert('파일 다운로드에 실패했습니다.');
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();

        // todo: CorpDocApply.js의 handleSubmit validation 검사 코드 중복성 해결
        const requiredInputs = {
            submission: formData.submission,
            purpose: formData.purpose,
            useDate: formData.useDate,
            type: formData.type,
            docFile: formData.department,
        }

        const selectedCorpDocs = ['document1', 'document2', 'document3', 'document4'].reduce((acc, docType, index) => {
            const quantityKey = `quantity${index + 1}`;
            acc[`cert${docType.charAt(0).toUpperCase() + docType.slice(1)}`] = {
                selected: formData[docType],
                quantity: formData[docType] ? formData[quantityKey] : '',
            };
            return acc;
        }, {});

        const inputDates = {
            useDate: formData.useDate
        }

        const { isValid, message } = validateForm('CorpDoc', requiredInputs, selectedCorpDocs, inputDates);
        if (!isValid) {
            alert(message);
            return;
        }

        const isFileDeleted = !file && !existingFile;

        if (JSON.stringify(formData) === JSON.stringify(initialData) && !file && !isFileDeleted) {
            alert('수정된 사항이 없습니다.');
            return;
        }

        try {
            const formDataToSend = new FormData();
            const typeValue = getTypeName(formData.type);

            formDataToSend.append('corpDocUpdateRequest', new Blob([JSON.stringify({
                drafter: auth.hngNm,
                submission: formData.submission,
                purpose: formData.purpose,
                useDate: formData.useDate,
                certCorpseal: formData.document1 ? parseInt(formData.quantity1) : 0,
                certCoregister: formData.document2 ? parseInt(formData.quantity2) : 0,
                certUsesignet: formData.document3 ? parseInt(formData.quantity3) : 0,
                warrant: formData.document4 ? parseInt(formData.quantity4) : 0,
                type: typeValue,
                notes: formData.notes,
            })], { type: 'application/json' }));

            if (file) {
                formDataToSend.append('file', file);
            }

            await axios.post(`/api/corpDoc/update?draftId=${draftId}&isFileDeleted=${isFileDeleted}`, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            alert('법인서류 수정이 완료되었습니다.');
            navigate('/myPendingList');
        } catch (error) {
            console.error('Error submitting corporate document:', error);
            alert('법인서류 수정 중 오류가 발생했습니다.');
        }
    };

    const handleReject = (e) => {
        e.preventDefault(); 
        setShowRejectModal(true);
      };
      
      const handleRejectClose = () => {
        setShowRejectModal(false);
      }; 

    const handleApprove = async (e) => {
        e.preventDefault(); 
        try {
            await axios.put(`/api/corpDoc/approve?draftId=${draftId}`);
            alert('문서가 승인되었습니다.');
            await refreshSidebar(); 
            navigate('/pendingList?documentType=법인서류');
        } catch (error) {
            console.error('Error approving document:', error);
            alert('문서 승인 중 오류가 발생했습니다.');
        }
    };
    
    const handleRejectConfirm = async (reason) => {
        try {
            const response = await axios.put(`/api/corpDoc/reject?draftId=${draftId}`, reason, {
                headers: {
                    'Content-Type': 'text/plain',
                },
            });
            if (response.data.code === 200) {
                alert('법인서류 신청이 반려되었습니다.');
                await refreshSidebar(); 
                navigate('/pendingList?documentType=법인서류');
            } else {
                alert('법인서류 신청 반려 중 오류가 발생하였습니다.');
            }
        } catch (error) {
            alert('법인서류 신청 반려 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className="content">
            <div className="corpDoc-content">
                <h2>{isReadOnly ? '법인서류 상세보기' : '법인서류 수정'} </h2>
                <Breadcrumb items={['나의 신청내역', '승인대기 내역', isReadOnly ? '법인서류 상세보기' : '법인서류 수정']} />
                <div className="corpDoc-main">
                    <div className="corpDoc-apply-content">
                        <form className="corpDoc-form" onSubmit={handleSubmit}>
                            <div className="corpDoc-bold-label">
                                <label>법인서류 신청서</label>
                            </div>
                            <div className="corpDoc-form-group">
                                <label>제출처 <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="text"
                                    name="submission"
                                    value={formData.submission}
                                    onChange={handleChange}
                                    disabled={isReadOnly}
                                />
                            </div>
                            <div className="corpDoc-form-group">
                                <label>사용목적 <span style={{ color: 'red' }}>*</span></label>
                                <textarea
                                    name="purpose"
                                    value={formData.purpose}
                                    onChange={handleChange}
                                    disabled={isReadOnly}
                                />
                            </div>
                            <div className="corpDoc-form-group">
                                <label>사용일자 <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="text"
                                    name="useDate"
                                    value={formData.useDate}
                                    onChange={handleChange}
                                    placeholder="YYYY-MM-DD"
                                    disabled={isReadOnly}
                                />
                            </div>
                            <div className="corpDoc-form-group">
                                <label>근거서류 <span style={{ color: 'red' }}>*</span></label>
                                {existingFile ? (
                                    <div className="file-display">
                                        <span className="file-name">{existingFile.name}</span>
                                        <div className="file-actions">
                                            <button
                                                type="button"
                                                className="download-button"
                                                onClick={handleFileDownloadClick}
                                            >
                                                <img src={downloadIcon} alt="다운로드" />
                                            </button>
                                            {!isReadOnly && (
                                                <button
                                                    type="button"
                                                    className="file-delete-button"
                                                    onClick={handleFileDelete}
                                                >
                                                    <img src={deleteIcon} alt="삭제" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <input
                                        type="file"
                                        name="file"
                                        className="file-input"
                                        onChange={handleFileChange}
                                        disabled={isReadOnly}
                                    />
                                )}
                            </div>
                            <div className="corpDoc-form-group">
                                <label>필요서류/수량 <span style={{ color: 'red' }}>*</span></label>
                                <div className="corpDoc-form-group-inline">
                                    <input
                                        type="checkbox"
                                        name="document1"
                                        checked={formData.document1}
                                        onChange={handleChange}
                                        disabled={isReadOnly}
                                        
                                    />
                                    <label> 법인인감증명서</label>
                                    <div className="corpDoc-form-group-inline-num">
                                        <label> 수량:</label>
                                        <input
                                            type="text"
                                            name="quantity1"
                                            value={formData.quantity1}
                                            onChange={handleChange}
                                            disabled={!formData.document1 || isReadOnly}
                                        />
                                        <label> 부</label>
                                    </div>
                                </div>
                                <div className="corpDoc-form-group-inline">
                                    <input
                                        type="checkbox"
                                        name="document2"
                                        checked={formData.document2}
                                        onChange={handleChange}
                                        disabled={isReadOnly}
                                    />
                                    <label> 법인등기사항전부증명서(등기부등본)</label>
                                    <div className="corpDoc-form-group-inline-num">
                                        <label> 수량:</label>
                                        <input
                                            type="text"
                                            name="quantity2"
                                            value={formData.quantity2}
                                            onChange={handleChange}
                                            disabled={!formData.document2 || isReadOnly}
                                        />
                                        <label> 부</label>
                                    </div>
                                </div>
                                <div className="corpDoc-form-group-inline">
                                    <input
                                        type="checkbox"
                                        name="document3"
                                        checked={formData.document3}
                                        onChange={handleChange}
                                        disabled={isReadOnly}
                                    />
                                    <label> 사용인감신고증명서</label>
                                    <div className="corpDoc-form-group-inline-num">
                                        <label> 수량:</label>
                                        <input
                                            type="text"
                                            name="quantity3"
                                            value={formData.quantity3}
                                            onChange={handleChange}
                                            disabled={!formData.document3 || isReadOnly}
                                        />
                                        <label> 부</label>
                                    </div>
                                </div>
                                <div className="corpDoc-form-group-inline">
                                    <input
                                        type="checkbox"
                                        name="document4"
                                        checked={formData.document4}
                                        onChange={handleChange}
                                        disabled={isReadOnly}
                                    />
                                    <label> 위임장</label>
                                    <div className="corpDoc-form-group-inline-num">
                                        <label> 수량:</label>
                                        <input
                                            type="text"
                                            name="quantity4"
                                            value={formData.quantity4}
                                            onChange={handleChange}
                                            disabled={!formData.document4 || isReadOnly}
                                        />
                                        <label> 부</label>
                                    </div>
                                </div>
                            </div>
                            <div className="corpDoc-form-group">
                                <label>제출형태 <span style={{ color: 'red' }}>*</span></label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    disabled={isReadOnly}
                                >
                                    <option value="">선택</option>
                                    <option value="original">원본</option>
                                    <option value="pdf">PDF</option>
                                    <option value="both">PDF+원본</option>
                                </select>
                            </div>
                            <div className="corpDoc-form-group">
                                <label>특이사항</label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    disabled={isReadOnly}
                                />
                            </div>
                            { !isReadOnly && (
                              <div className="edit-buttons">
                                <CustomButton className="apply-request-button" onClick={handleSubmit}>
                                    수정하기
                                </CustomButton>
                                </div>
                            )}
                            {applyStatus === '승인대기' && isReadOnly && (
                                <div className="corpDoc-apply-button-container">
                                    <div className="approval-buttons">
                                        <CustomButton className="approve-button" onClick={handleApprove}>승인</CustomButton>
                                        <CustomButton className="reject-button" onClick={handleReject}>반려</CustomButton>
                                    </div>
                                </div>
                            )}
                        </form>    
                        {showRejectModal && (
                            <ReasonModal 
                                show={showRejectModal}
                                onConfirm={handleRejectConfirm}
                                onClose={handleRejectClose}
                            />
                        )}
                        <ReasonModal 
                            show={showDownloadReasonModal} 
                            onClose={handleDownloadModalClose}
                            onConfirm={handleFileDownloadConfirm} 
                            modalType="download" 
                        />
                    </div>
                </div>
            </div>
            
        </div>
    );
}

export default DetailCorpDocApplication;
