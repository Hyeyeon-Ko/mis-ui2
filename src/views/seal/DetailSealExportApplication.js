import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/common/Breadcrumb';
import CustomButton from '../../components/common/CustomButton';
import { AuthContext } from '../../components/AuthContext';
import axios from 'axios';
import '../../styles/common/Page.css';
import '../../styles/seal/SealApplyExport.css';
import corporateSeal from '../../assets/images/corporate_seal.png';
import facsimileSeal from '../../assets/images/facsimile_seal.png';
import companySeal from '../../assets/images/company_seal.png';

function DetailSealExportApplication() {
    const { auth } = useContext(AuthContext);
    const { draftId } = useParams(); 
    const navigate = useNavigate();

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
        isFileDeleted: false,
    });

    useEffect(() => {
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
    }, [draftId]);

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

    const handleFileChange = (e) => {
        setApplicationDetails(prevState => ({
            ...prevState,
            file: e.target.files[0],
            isFileDeleted: false,
        }));
    };

    const handleFileDelete = () => {
        setApplicationDetails(prevState => ({
            ...prevState,
            file: null,
            isFileDeleted: true,  
        }));
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

    const handleChange = (e) => {
        setApplicationDetails({
            ...applicationDetails,
            [e.target.name]: e.target.value,
        });
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
                                />
                            </div>
                            <div className='seal-export-form-group'>
                                <label>신청부서</label>
                                <input
                                    type="text"
                                    name="useDept"
                                    value={applicationDetails.useDept}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className='seal-export-form-group'>
                                <label>사용용도</label>
                                <textarea
                                    name="purpose"
                                    value={applicationDetails.purpose}
                                    onChange={handleChange}
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
                                                    placeholder="부수"
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
                                                    placeholder="부수"
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
                                                    placeholder="부수"
                                                    value={sealSelections.companySeal.quantity}
                                                    onChange={(e) => handleQuantityChange(e, 'companySeal')}
                                                    disabled={!sealSelections.companySeal.selected}
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
                                />
                            </div>
                            <div className='seal-export-form-group'>
                                <label>반출일자</label>
                                <input
                                    type="text"
                                    name="expDate"
                                    value={applicationDetails.expDate}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className='seal-export-form-group'>
                                <label>반납일자</label>
                                <input
                                    type="text"
                                    name="returnDate"
                                    value={applicationDetails.returnDate}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className='seal-export-form-group'>
                                <label>참조자료</label>
                                {applicationDetails.file && (
                                    <div className="file-preview">
                                        <span>{applicationDetails.file.name}</span>
                                        <button type="button" onClick={handleFileDelete}>삭제</button>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    name="purposeFile"
                                    className="file-input"
                                    onChange={handleFileChange}
                                    disabled={applicationDetails.isFileDeleted}
                                />
                            </div>
                            <div className="seal-export-apply-button-container">
                                <CustomButton className="apply-request-button" type="submit">
                                    수정완료
                                </CustomButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DetailSealExportApplication;
