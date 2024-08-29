import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Breadcrumb from '../../components/common/Breadcrumb';
import CustomButton from '../../components/common/CustomButton';
import { AuthContext } from '../../components/AuthContext';
import axios from 'axios';
import '../../styles/common/Page.css';
import '../../styles/seal/SealApplyImprint.css';
import corporateSeal from '../../assets/images/corporate_seal.png';
import facsimileSeal from '../../assets/images/facsimile_seal.png';
import companySeal from '../../assets/images/company_seal.png';

function DetailSealImprintApplication() {
    const { auth } = useContext(AuthContext);
    const { draftId } = useParams(); 
    const navigate = useNavigate();
    const location = useLocation();
    const { sealImprintDetails, readOnly } = location.state || {}; 

    const [sealSelections, setSealSelections] = useState({
        corporateSeal: { selected: false, quantity: '' },
        facsimileSeal: { selected: false, quantity: '' },
        companySeal: { selected: false, quantity: '' },
    });
    const [applicationDetails, setApplicationDetails] = useState({
        submission: '',
        useDate: '',
        purpose: '',
        notes: '',
    });

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
    }, [draftId, sealImprintDetails]);

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

    const handleSubmit = (e) => {
        e.preventDefault();
    
        const selectedSeals = {
            corporateSeal: sealSelections.corporateSeal.selected ? sealSelections.corporateSeal.quantity : '',
            facsimileSeal: sealSelections.facsimileSeal.selected ? sealSelections.facsimileSeal.quantity : '',
            companySeal: sealSelections.companySeal.selected ? sealSelections.companySeal.quantity : '',
        };
    
        const updatedImprintRequestDTO = {
            drafter: auth.hngNm,
            drafterId: auth.userId,
            submission: applicationDetails.submission,
            useDate: applicationDetails.useDate,
            corporateSeal: selectedSeals.corporateSeal,
            facsimileSeal: selectedSeals.facsimileSeal,
            companySeal: selectedSeals.companySeal,
            purpose: applicationDetails.purpose,
            notes: applicationDetails.notes,
            instCd: auth.instCd,
        };
    
        axios.post(`/api/seal/imprint/update`, updatedImprintRequestDTO, {
            params: { draftId }, 
        })
        .then(response => {
            console.log('Response:', response.data);
            alert('인장 신청이 성공적으로 수정되었습니다.');
            navigate('/api/myPendingList');
        })
        .catch(error => {
            console.error('Error updating application:', error);
            alert('인장 신청 수정 중 오류가 발생했습니다. 다시 시도해주세요.');
        });
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
            <div className="seal-imprint-content">
                <h2>인장신청 상세정보</h2>
                <Breadcrumb items={['신청하기', '인장신청', '상세정보']} />
                <div className='seal-imprint-main'>
                    <div className='seal-imprint-apply-content'>
                        <form className='seal-imprint-form' onSubmit={handleSubmit}>
                            <div className='seal-imprint-bold-label'>
                                <label>인장 날인 신청서</label>
                            </div>
                            <div className='seal-imprint-form-group'>
                                <label>제출처</label>
                                <input
                                    type="text"
                                    name="submission"
                                    value={applicationDetails.submission}
                                    onChange={handleChange}
                                    disabled={readOnly}
                                />
                            </div>
                            <div className='seal-imprint-form-group'>
                                <label>사용일자</label>
                                <input
                                    type="text"
                                    name="useDate"
                                    value={applicationDetails.useDate}
                                    onChange={handleChange}
                                    disabled={readOnly}
                                />
                            </div>
                            <div className='seal-imprint-form-group'>
                                <label>사용목적</label>
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
                              <div className="seal-imprint-apply-button-container">
                                  <CustomButton className="apply-request-button" type="submit">
                                      수정완료
                                  </CustomButton>
                              </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DetailSealImprintApplication;
