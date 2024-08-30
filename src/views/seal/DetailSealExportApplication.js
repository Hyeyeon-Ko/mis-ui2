import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Breadcrumb from '../../components/common/Breadcrumb';
import CustomButton from '../../components/common/CustomButton';
import { AuthContext } from '../../components/AuthContext';
import axios from 'axios';
import '../../styles/common/Page.css';
import '../../styles/seal/SealApplyExport.css';
import corporateSeal from '../../assets/images/corporate_seal.png';
import facsimileSeal from '../../assets/images/facsimile_seal.png';
import companySeal from '../../assets/images/company_seal.png';
import RejectReasonModal from '../../components/RejectReasonModal';
import downloadIcon from '../../assets/images/download.png';
import deleteIcon from '../../assets/images/delete2.png';

function DetailSealExportApplication() {
    const { auth } = useContext(AuthContext);
    const { draftId } = useParams(); 
    const navigate = useNavigate();
    const location = useLocation();
    const { sealExportDetails, readOnly } = location.state || {};
    const queryParams = new URLSearchParams(location.search);
    const applyStatus = queryParams.get('applyStatus'); 

    const [showRejectModal, setShowRejectModal] = useState(false);
    const [sealSelections, setSealSelections] = useState({
        corporateSeal: { selected: false, quantity: '' },
        facsimileSeal: { selected: false, quantity: '' },
        companySeal: { selected: false, quantity: '' },
    });

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

    useEffect(() => {
        if (sealExportDetails) {
            setApplicationDetails({
                submission: sealExportDetails.submission || '',
                useDept: sealExportDetails.useDept || '',
                expNm: sealExportDetails.expNm || '',
                expDate: sealExportDetails.expDate || '',
                returnDate: sealExportDetails.returnDate || '',
                purpose: sealExportDetails.purpose || '',
                file: sealExportDetails.file || null,
                fileName: sealExportDetails.fileName || '',  
                filePath: sealExportDetails.filePath || '',  
                isFileDeleted: false,  
            });

            setSealSelections({
                corporateSeal: {
                    selected: !!sealExportDetails.corporateSeal,
                    quantity: sealExportDetails.corporateSeal || '',
                },
                facsimileSeal: {
                    selected: !!sealExportDetails.facsimileSeal,
                    quantity: sealExportDetails.facsimileSeal || '',
                },
                companySeal: {
                    selected: !!sealExportDetails.companySeal,
                    quantity: sealExportDetails.companySeal || '',
                },
            });
        } else {
            axios.get(`/api/seal/export/${draftId}`)
                .then(response => {
                    const data = response.data.data;
                    setApplicationDetails({
                        submission: data.submission || '',
                        useDept: data.useDept || '',
                        expNm: data.expNm || '',
                        expDate: data.expDate || '',
                        returnDate: data.returnDate || '',
                        purpose: data.purpose || '',
                        file: data.file || null,
                        fileName: data.fileName || '',  
                        filePath: data.filePath || '',  
                        isFileDeleted: false, 
                    });

                    setSealSelections({
                        corporateSeal: {
                            selected: !!data.corporateSeal,
                            quantity: data.corporateSeal || '',
                        },
                        facsimileSeal: {
                            selected: !!data.facsimileSeal,
                            quantity: data.facsimileSeal || '',
                        },
                        companySeal: {
                            selected: !!data.companySeal,
                            quantity: data.companySeal || '',
                        },
                    });
                })
                .catch(error => {
                    console.error('Error fetching application details:', error);
                    alert('반출신청 정보를 불러오는 중 오류가 발생했습니다.');
                });
        }
    }, [draftId, sealExportDetails]);

    const handleSealChange = (sealName) => {
        if (!readOnly) {
            setSealSelections(prevState => ({
                ...prevState,
                [sealName]: {
                    ...prevState[sealName],
                    selected: !prevState[sealName].selected,
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        const selectedSeals = {
            corporateSeal: sealSelections.corporateSeal.selected ? sealSelections.corporateSeal.quantity : '',
            facsimileSeal: sealSelections.facsimileSeal.selected ? sealSelections.facsimileSeal.quantity : '',
            companySeal: sealSelections.companySeal.selected ? sealSelections.companySeal.quantity : '',
        };

        const updatedExportRequestDTO = {
            drafter: auth.hngNm,
            drafterId: auth.userId,
            submission: applicationDetails.submission,
            useDept: applicationDetails.useDept,
            expNm: applicationDetails.expNm,
            expDate: applicationDetails.expDate,
            returnDate: applicationDetails.returnDate,
            corporateSeal: selectedSeals.corporateSeal,
            facsimileSeal: selectedSeals.facsimileSeal,
            companySeal: selectedSeals.companySeal,
            purpose: applicationDetails.purpose,
            instCd: auth.instCd,
        };

        const formData = new FormData();
        formData.append('exportUpdateRequestDTO', new Blob([JSON.stringify(updatedExportRequestDTO)], {
            type: 'application/json'
        }));
        if (applicationDetails.file) {
            formData.append('file', applicationDetails.file);
        }
        formData.append('isFileDeleted', applicationDetails.isFileDeleted);

        try {
            const response = await axios.post(`/api/seal/export/update?draftId=${draftId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log('Response:', response.data);
            alert('인장 반출 신청이 성공적으로 수정되었습니다.');
            navigate('/api/myPendingList');
        } catch (error) {
            console.error('Error updating application:', error);
            alert('인장 반출 신청 수정 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
    };

    const handleApproval = (e) => {
        e.preventDefault();  
        axios.post(`/api/seal/${draftId}`) 
        .then(response => {
            console.log('Approval Response:', response.data);
            alert('인장 신청이 성공적으로 승인되었습니다.');
            navigate('/api/pendingList?documentType=인장신청');
        })
        .catch(error => {
            console.error('Error approving application:', error);
            alert('인장 신청 승인 중 오류가 발생했습니다. 다시 시도해주세요.');
            navigate('/api/pendingList?documentType=인장신청');
        });
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
            navigate(`/api/pendingList?documentType=인장신청`);  
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

    return (
        <div className="content">
            <div className="seal-export-content">
                <h2>인장반출 신청 상세정보</h2>
                <Breadcrumb items={['신청하기', '인장신청', '상세정보']} />
                <div className='seal-export-main'>
                    <div className='seal-export-apply-content'>
                        <form className='seal-export-form' onSubmit={handleSubmit}>
                            <div className='seal-export-bold-label'>
                                <label>인장 반출 신청서</label>
                            </div>
                            <div className='seal-export-form-group'>
                                <label>제출처</label>
                                <input
                                    type="text"
                                    name="submission"
                                    value={applicationDetails.submission}
                                    onChange={handleChange}
                                    disabled={readOnly}
                                />
                            </div>
                            <div className='seal-export-form-group'>
                                <label>신청부서</label>
                                <input
                                    type="text"
                                    name="useDept"
                                    value={applicationDetails.useDept}
                                    onChange={handleChange}
                                    disabled={readOnly}
                                />
                            </div>
                            <div className='seal-export-form-group'>
                                <label>사용용도</label>
                                <textarea
                                    name="purpose"
                                    value={applicationDetails.purpose}
                                    onChange={handleChange}
                                    disabled={readOnly}
                                />
                            </div>
                            <div className='seal-imprint-form-group'>
                                <label>인장구분</label>
                                <div className="seal-imprint-options">
                                    <label>
                                        <div className='seal-imprint-detail-option'>
                                            <div className='seal-imprint-detail-left'>
                                                <input
                                                    type="checkbox"
                                                    name="corporateSeal"
                                                    checked={sealSelections.corporateSeal.selected}
                                                    onChange={() => handleSealChange('corporateSeal')}
                                                    disabled={readOnly}
                                                />
                                            </div>
                                            <div className='seal-imprint-detail-right'>
                                                <img src={corporateSeal} alt="Corporate Seal" className="seal-imprint-image" />
                                                <span>법인인감</span>
                                                <input
                                                    type="number"
                                                    name="corporateSealQuantity"
                                                    min="1"
                                                    placeholder="부수"
                                                    value={sealSelections.corporateSeal.quantity}
                                                    onChange={(e) => handleQuantityChange(e, 'corporateSeal')}
                                                    disabled={!sealSelections.corporateSeal.selected || readOnly}
                                                />
                                            </div>
                                        </div>
                                    </label>
                                    <label>
                                        <div className='seal-imprint-detail-option'>
                                            <div className='seal-imprint-detail-left'>
                                                <input
                                                    type="checkbox"
                                                    name="facsimileSeal"
                                                    checked={sealSelections.facsimileSeal.selected}
                                                    onChange={() => handleSealChange('facsimileSeal')}
                                                    disabled={readOnly}
                                                />
                                            </div>
                                            <div className='seal-imprint-detail-right'>
                                                <img src={facsimileSeal} alt="Facsimile Seal" className="seal-imprint-image" />
                                                <span>사용인감</span>
                                                <input
                                                    type="number"
                                                    name="facsimileSealQuantity"
                                                    min="1"
                                                    placeholder="부수"
                                                    value={sealSelections.facsimileSeal.quantity}
                                                    onChange={(e) => handleQuantityChange(e, 'facsimileSeal')}
                                                    disabled={!sealSelections.facsimileSeal.selected || readOnly}
                                                />
                                            </div>
                                        </div>
                                    </label>
                                    <label>
                                        <div className='seal-imprint-detail-option'>
                                            <div className='seal-imprint-detail-left'>
                                                <input
                                                    type="checkbox"
                                                    name="companySeal"
                                                    checked={sealSelections.companySeal.selected}
                                                    onChange={() => handleSealChange('companySeal')}
                                                    disabled={readOnly}
                                                />
                                            </div>
                                            <div className='seal-imprint-detail-right'>
                                                <img src={companySeal} alt="Company Seal" className="seal-imprint-image" />
                                                <span>회사인</span>
                                                <input
                                                    type="number"
                                                    name="companySealQuantity"
                                                    min="1"
                                                    placeholder="부수"
                                                    value={sealSelections.companySeal.quantity}
                                                    onChange={(e) => handleQuantityChange(e, 'companySeal')}
                                                    disabled={!sealSelections.companySeal.selected || readOnly}
                                                />
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                            <div className='seal-export-form-group'>
                                <label>반출자명</label>
                                <input
                                    type="text"
                                    name="expNm"
                                    value={applicationDetails.expNm}
                                    onChange={handleChange}
                                    disabled={readOnly}
                                />
                            </div>
                            <div className='seal-export-form-group'>
                                <label>반출일자</label>
                                <input
                                    type="text"
                                    name="expDate"
                                    value={applicationDetails.expDate}
                                    onChange={handleChange}
                                    disabled={readOnly}
                                />
                            </div>
                            <div className='seal-export-form-group'>
                                <label>반납일자</label>
                                <input
                                    type="text"
                                    name="returnDate"
                                    value={applicationDetails.returnDate}
                                    onChange={handleChange}
                                    disabled={readOnly}
                                />
                            </div>
                            <div className='seal-export-form-group'>
                                <label>참조자료</label>
                                {applicationDetails.fileName && applicationDetails.filePath ? (
                                    <div className="file-display">
                                        <span className="file-name">{applicationDetails.fileName}</span>
                                        <div className="file-actions">
                                            <button
                                                type="button"
                                                className="download-button"
                                                onClick={handleFileDownload}
                                            >
                                                <img src={downloadIcon} alt="다운로드" />
                                            </button>
                                            {!readOnly && (
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
                                    !readOnly && (
                                        <input
                                            type="file"
                                            name="purposeFile"
                                            className="file-input"
                                            onChange={handleFileChange}
                                        />
                                    )
                                )}
                            </div>
                            {!readOnly && (
                              <div className="seal-export-apply-button-container">
                                  <CustomButton className="apply-request-button" type="submit">
                                      수정완료
                                  </CustomButton>
                              </div>
                            )}
                            {applyStatus === '승인대기' && readOnly && (
                                <div className="seal-export-approval-buttons">
                                    <CustomButton className="approve-button" onClick={handleApproval}>승인</CustomButton>
                                    <CustomButton className="reject-button" onClick={handleReject}>반려</CustomButton>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
            <RejectReasonModal show={showRejectModal} onClose={handleRejectClose} onConfirm={handleRejectConfirm} />
        </div>
    );
}

export default DetailSealExportApplication;
