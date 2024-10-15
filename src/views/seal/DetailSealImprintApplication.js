import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Breadcrumb from '../../components/common/Breadcrumb';
import CustomButton from '../../components/common/CustomButton';
import { AuthContext } from '../../components/AuthContext';
import { validateForm } from '../../hooks/validateForm';
import axios from 'axios';
import '../../styles/common/Page.css';
import '../../styles/seal/SealApplyImprint.css';
import corporateSeal from '../../assets/images/corporate_seal.png';
import facsimileSeal from '../../assets/images/facsimile_seal.png';
import companySeal from '../../assets/images/company_seal.png';
import { useSealForm } from '../../hooks/useSealForm';
import ReasonModal from '../../components/ReasonModal';
import { useDateChange } from '../../hooks/apply/useDateChange';



function DetailSealImprintApplication() {
    const {handleSealChange, handleQuantityChange, handleChange, applicationDetails, setApplicationDetails, sealSelections, setSealSelections} = useSealForm();
    const { auth, refreshSidebar } = useContext(AuthContext);
    const { draftId } = useParams(); 
    const navigate = useNavigate();
    const location = useLocation();
    const { sealImprintDetails, readOnly } = location.state || {}; 
    const queryParams = new URLSearchParams(location.search);
    const applyStatus = queryParams.get('applyStatus'); 
    const [showRejectModal, setShowRejectModal] = useState(false);
    
    const [formattedDate, handleUseDateChange] = useDateChange();

    useEffect(() => {
        if (sealImprintDetails) {
            setApplicationDetails({
                submission: sealImprintDetails.submission || '',
                useDate: sealImprintDetails.useDate || '',
                purpose: sealImprintDetails.purpose || '',
                notes: sealImprintDetails.notes || '',
            });
    
            setSealSelections({
                corporateSeal: {
                    selected: !!sealImprintDetails.corporateSeal,
                    quantity: sealImprintDetails.corporateSeal || '',
                },
                facsimileSeal: {
                    selected: !!sealImprintDetails.facsimileSeal,
                    quantity: sealImprintDetails.facsimileSeal || '',
                },
                companySeal: {
                    selected: !!sealImprintDetails.companySeal,
                    quantity: sealImprintDetails.companySeal || '',
                },
            });
        } else {
            axios.get(`/api/seal/imprint/${draftId}`)
                .then(response => {
                    const data = response.data.data;
                    setApplicationDetails({
                        submission: data.submission || '',
                        useDate: data.useDate || '',
                        purpose: data.purpose || '',
                        notes: data.notes || '',
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
                    alert('날인신청 정보를 불러오는 중 오류가 발생했습니다.');
                });
        }
    }, [draftId, sealImprintDetails, setApplicationDetails, setSealSelections]);

    const handleSubmit = (e) => {
        e.preventDefault();

        // 1. SealForm validation
        const requiredInputs = {
            submission: applicationDetails.submission,
            useDate: applicationDetails.useDate,
            purpose: applicationDetails.purpose,
        }

        const selectedSeals = ['corporateSeal', 'facsimileSeal', 'companySeal'].reduce((acc, sealType) => {
            const { selected, quantity } = sealSelections[sealType];
            acc[sealType] = {
                selected,
                quantity: selected ? quantity : '',
            };
            return acc;
        }, {});

        const inputDates = {
            useDate: applicationDetails.useDate
        }

        const { isValid, message } = validateForm('Seal', requiredInputs, selectedSeals, inputDates);
        if (!isValid) {
            alert(message);
            return;
        }
    
        const updatedImprintRequestDTO = {
            submission: applicationDetails.submission,
            useDate: applicationDetails.useDate,
            corporateSeal: selectedSeals.corporateSeal.quantity,
            facsimileSeal: selectedSeals.facsimileSeal.quantity,
            companySeal: selectedSeals.companySeal.quantity,
            purpose: applicationDetails.purpose,
            notes: applicationDetails.notes,
        };
    
        axios.post(`/api/seal/imprint/update`, updatedImprintRequestDTO, {
            params: { draftId }, 
        })
        .then(response => {
            alert('인장 신청이 성공적으로 수정되었습니다.');
            navigate('/myPendingList');
        })
        .catch(error => {
            console.error('Error updating application:', error);
            alert('인장 신청 수정 중 오류가 발생했습니다. 다시 시도해주세요.');
        });
    };

    const handleApproval = (e) => {
        e.preventDefault();  
        axios.post(`/api/seal/${draftId}`, {
            userId: auth.userId,
        }) 
        .then(response => {
            alert('인장 신청이 성공적으로 승인되었습니다.');
            navigate('/pendingList?documentType=인장신청');
        })
        .catch(error => {
            console.error('Error approving application:', error);
            alert('인장 신청 승인 중 오류가 발생했습니다. 다시 시도해주세요.');
            navigate('/pendingList?documentType=인장신청');
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
          const response = await axios.post(`/api/seal/return/${draftId}`, {
            userId: auth.userId,
            rejectReason: reason
          }, {
            headers: {
              'Content-Type': 'application/json',
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

    const handleCancelRequest = () => {
        navigate('/myPendingList');
    }    

    return (
        <div className="content">
            <div className="seal-imprint-content">
                <h2>{readOnly ? '인장날인 상세보기': '인장날인 수정'}</h2>
                <Breadcrumb items={readOnly ? ['인장 관리', '인장날인 상세보기'] : ['나의 신청내역', '승인대기 내역', '인장날인 수정']} />
                <div className='seal-imprint-main'>
                    <div className='seal-imprint-apply-content'>
                        <form className='seal-imprint-form'>
                            <div className='seal-imprint-bold-label'>
                                <label>인장 날인 신청서</label>
                            </div>
                            <div className='seal-imprint-form-group'>
                                <label>제출처 <span>*</span></label>
                                <input
                                    type="text"
                                    name="submission"
                                    value={applicationDetails.submission}
                                    onChange={handleChange}
                                    disabled={readOnly}
                                />
                            </div>
                            <div className='seal-imprint-form-group'>
                                <label>사용일자 <span>*</span></label>
                                <input
                                    type="text"
                                    name="useDate"
                                    value={formattedDate || applicationDetails.useDate}
                                    onChange={(e) => {
                                        handleUseDateChange(e);
                                        handleChange(e);
                                    }}
                                    disabled={readOnly}
                                />
                            </div>
                            <div className='seal-imprint-form-group'>
                                <label>사용목적 <span>*</span></label>
                                <textarea
                                    name="purpose"
                                    value={applicationDetails.purpose}
                                    onChange={handleChange}
                                    disabled={readOnly}
                                />
                            </div>
                            <div className='seal-imprint-form-group'>
                                <label>인장구분 <span>*</span></label>
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
                                                    placeholder="수량"
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
                                                    placeholder="수량"
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
                                                    placeholder="수량"
                                                    value={sealSelections.companySeal.quantity}
                                                    onChange={(e) => handleQuantityChange(e, 'companySeal')}
                                                    disabled={!sealSelections.companySeal.selected || readOnly}
                                                />
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                            <div className='seal-imprint-form-group'>
                                <label>특이사항</label>
                                <textarea
                                    name="notes"
                                    value={applicationDetails.notes}
                                    onChange={handleChange}
                                    disabled={readOnly}
                                />
                            </div>
                            {!readOnly && (
                              <div className="modify-seal-buttons-container">
                                  <CustomButton className="apply-request-button" onClick={handleSubmit}>수정완료</CustomButton>
                                  <CustomButton className="apply-cancel-button" onClick={handleCancelRequest}>수정취소</CustomButton>
                              </div>
                            )}
                            {applyStatus === '승인대기' && readOnly && (
                                <div className="seal-imprint-approval-buttons">
                                    <CustomButton className="approve-button" onClick={handleApproval}>승인</CustomButton>
                                    <CustomButton className="reject-button" onClick={handleReject}>반려</CustomButton>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
            <ReasonModal show={showRejectModal} onClose={handleRejectClose} onConfirm={handleRejectConfirm} modalType="reject"/>
        </div>
    );
}

export default DetailSealImprintApplication;
