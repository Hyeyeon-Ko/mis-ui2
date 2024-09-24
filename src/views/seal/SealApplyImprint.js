import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import Breadcrumb from '../../components/common/Breadcrumb';
import CustomButton from '../../components/common/CustomButton';
import { AuthContext } from '../../components/AuthContext';
import '../../styles/common/Page.css';
import '../../styles/seal/SealApplyImprint.css';
import corporateSeal from '../../assets/images/corporate_seal.png';
import facsimileSeal from '../../assets/images/facsimile_seal.png';
import companySeal from '../../assets/images/company_seal.png';

function SealApplyImprint() {
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate(); 

    const [sealSelections, setSealSelections] = useState({
        corporateSeal: { selected: false, quantity: '' },
        facsimileSeal: { selected: false, quantity: '' },
        companySeal: { selected: false, quantity: '' },
    });

    const handleSealChange = (sealName) => {
        setSealSelections(prevState => ({
            ...prevState,
            [sealName]: {
                ...prevState[sealName],
                selected: !prevState[sealName].selected,
            }
        }));
    };

    const handleQuantityChange = (e, sealName) => {
        const value = e.target.value;
        setSealSelections(prevState => ({
            ...prevState,
            [sealName]: {
                ...prevState[sealName],
                quantity: value
            }
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
    
        const submission = e.target.elements.destination.value.trim();
        const useDate = e.target.elements.useDate.value.trim();
        const purpose = e.target.elements.purpose.value.trim();
    
        const isAnySealSelected = sealSelections.corporateSeal.selected || sealSelections.facsimileSeal.selected || sealSelections.companySeal.selected;
    
        if (!isAnySealSelected) {
            alert('최소 하나의 인감을 선택해야 합니다.');
            return;
        }
    
        const selectedSeals = {
            corporateSeal: sealSelections.corporateSeal.selected ? sealSelections.corporateSeal.quantity : '',
            facsimileSeal: sealSelections.facsimileSeal.selected ? sealSelections.facsimileSeal.quantity : '',
            companySeal: sealSelections.companySeal.selected ? sealSelections.companySeal.quantity : '',
        };
    
        const imprintRequestDTO = {
            drafter: auth.hngNm,
            drafterId: auth.userId,
            submission,
            useDate,
            corporateSeal: selectedSeals.corporateSeal,
            facsimileSeal: selectedSeals.facsimileSeal,
            companySeal: selectedSeals.companySeal,
            purpose,
            notes: e.target.elements.notes.value,
            instCd: auth.instCd,
        };
    
        axios.post('/api/seal/imprint', imprintRequestDTO)
            .then(response => {
                alert('인장 신청이 완료되었습니다.');
                navigate('/myPendingList');
            })
            .catch(error => {
                console.error('Error:', error);
                alert('인장 신청 중 오류가 발생했습니다. 다시 시도해주세요.');
            });
    };
    
    return (
        <div className="content">
            <div className="seal-imprint-content">
                <h2>인장신청</h2>
                <Breadcrumb items={['신청하기', '인장신청']} />
                <div className='seal-imprint-main'>
                    <div className='seal-imprint-apply-content'>
                        <form className='seal-imprint-form' onSubmit={handleSubmit}>
                            <div className='seal-imprint-bold-label'>
                                <label>인장 날인 신청서</label>
                            </div>
                            <div className='seal-imprint-form-group'>
                                <label>제출처</label>
                                <input type="text" name="destination" required/>
                            </div>
                            <div className='seal-imprint-form-group'>
                                <label>사용일자</label>
                                <input type="text" name="useDate" required placeholder="YYYY-MM-DD"/>
                            </div>
                            <div className='seal-imprint-form-group'>
                                <label>사용목적</label>
                                <textarea name="purpose" required/>
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
                                                    disabled={!sealSelections.corporateSeal.selected}
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
                                                    disabled={!sealSelections.facsimileSeal.selected}
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
                                                    disabled={!sealSelections.companySeal.selected}
                                                />
                                            </div>
                                        </div>
                                    </label>
                                </div>
                                <div className="seal-imprint-disclaimer">
                                    *실제 인감이 아닙니다.
                                </div>
                            </div>
                            <div className='seal-imprint-form-group'>
                                <label>특이사항</label>
                                <textarea name="notes" />
                            </div>
                            <div className="seal-imprint-apply-button-container">
                                <CustomButton className="apply-request-button" type="submit">
                                    인장 신청하기
                                </CustomButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SealApplyImprint;
