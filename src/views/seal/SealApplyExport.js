import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/common/Breadcrumb';
import CustomButton from '../../components/common/CustomButton';
import { AuthContext } from '../../components/AuthContext';
import '../../styles/common/Page.css';
import '../../styles/seal/SealApplyExport.css';
import corporateSeal from '../../assets/images/corporate_seal.png';
import facsimileSeal from '../../assets/images/facsimile_seal.png';
import companySeal from '../../assets/images/company_seal.png';

function SealApplyExport() {
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [sealSelections, setSealSelections] = useState({
        corporateSeal: { selected: false, quantity: '' },
        facsimileSeal: { selected: false, quantity: '' },
        companySeal: { selected: false, quantity: '' },
    });

    const [file, setFile] = useState(null);

    const handleSealChange = (sealName) => {
        setSealSelections(prevState => ({
            ...prevState,
            [sealName]: {
                ...prevState[sealName],
                selected: !prevState[sealName].selected,
                quantity: ''
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

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const submission = e.target.elements.destination.value.trim();
        const department = e.target.elements.department.value.trim();
        const draftNm = e.target.elements.draftNm.value.trim();
        const exportDate = e.target.elements.exportDate.value.trim();
        const returnDate = e.target.elements.returnDate.value.trim();
        const purpose = e.target.elements.purpose.value.trim();
        const corporateSealQuantity = sealSelections.corporateSeal.selected ? sealSelections.corporateSeal.quantity : '';
        const facsimileSealQuantity = sealSelections.facsimileSeal.selected ? sealSelections.facsimileSeal.quantity : '';
        const companySealQuantity = sealSelections.companySeal.selected ? sealSelections.companySeal.quantity : '';
        
        if (!corporateSealQuantity && !facsimileSealQuantity && !companySealQuantity) {
            alert('최소 하나의 인감을 선택해야 합니다.');
            return;
        }
    
        if (!submission || !department || !draftNm || !exportDate || !returnDate || !purpose) {
            alert('모든 필수 항목을 입력해주세요.');
            return; 
        }
        
        const selectedSeals = {
            corporateSeal: corporateSealQuantity,
            facsimileSeal: facsimileSealQuantity,
            companySeal: companySealQuantity,
        };
        
        const exportRequestDTO = {
            drafter: auth.hngNm,
            drafterId: auth.userId,
            submission: submission,
            useDept: department,
            expNm: draftNm,
            expDate: exportDate,
            returnDate: returnDate,
            corporateSeal: selectedSeals.corporateSeal,
            facsimileSeal: selectedSeals.facsimileSeal,
            companySeal: selectedSeals.companySeal,
            purpose: purpose,
            instCd: auth.instCd,
        };
        
        const formData = new FormData();
        formData.append('exportRequestDTO', new Blob([JSON.stringify(exportRequestDTO)], {
            type: 'application/json'
        }));
        if (file) {
            formData.append('file', file); 
        }
        
        try {
            await axios.post('/api/seal/export', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            alert('반출 신청이 완료되었습니다.');
            navigate('/api/myPendingList');
        } catch (error) {
            console.error('Error:', error);
            alert('반출 신청 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
    };
        
    return (
        <div className="content">
            <div className="seal-export-content">
                <h2>인장신청</h2>
                <Breadcrumb items={['신청하기', '인장신청']} />
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
                                    name="destination"
                                    required
                                />
                            </div>
                            <div className='seal-export-form-group'>
                                <label>신청부서</label>
                                <input
                                    type="text"
                                    name="department"
                                    required
                                />
                            </div>
                            <div className='seal-export-form-group'>
                                <label>사용용도</label>
                                <textarea
                                    name="purpose"
                                    required
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
                                <div className="seal-export-disclaimer">
                                    *실제 인감이 아닙니다.
                                </div>
                            </div>
                            <div className='seal-export-form-group'>
                                <label>반출자명</label>
                                <input
                                    type="text"
                                    name="draftNm"
                                    required
                                />
                            </div>
                            <div className='seal-export-form-group'>
                                <label>반출일자</label>
                                <input
                                    type="text"
                                    name="exportDate"
                                    placeholder="YYYY-MM-DD"
                                    required
                                />
                            </div>
                            <div className='seal-export-form-group'>
                                <label>반납일자</label>
                                <input
                                    type="text"
                                    name="returnDate"
                                    placeholder="YYYY-MM-DD"
                                
                                    required
                                />
                            </div>
                            <div className='seal-export-form-group'>
                                <label>참조자료</label>
                                <input
                                    type="file"
                                    name="purposeFile"
                                    className="file-input"
                                    onChange={handleFileChange}
                                />
                            </div>
                            <div className="seal-export-apply-button-container">
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

export default SealApplyExport;
