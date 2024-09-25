import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../components/AuthContext';
import { validateForm } from '../../hooks/validateForm';
import { getTypeName } from '../../hooks/fieldNameUtils';
import Breadcrumb from '../../components/common/Breadcrumb';
import CustomButton from '../../components/common/CustomButton';
import '../../styles/common/Page.css';
import '../../styles/corpdoc/CorpDocApply.css';

function CorpDocApply() {
    const navigate = useNavigate();
    const { auth } = useContext(AuthContext); 
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
        setFormData((prevFormData) => ({
            ...prevFormData,
            department: e.target.files[0],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. SealForm Validation
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

        // 2. Submit CorpDocForm
        const payload = new FormData();
        const typeValue = getTypeName(formData.type);

        payload.append('corpDocRequest', new Blob([JSON.stringify({
            drafter: auth.hngNm,
            drafterId: auth.userId,
            instCd: auth.instCd,
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

        if (formData.department) {
            payload.append('file', formData.department);
        }

        try {
            const response = await fetch('/api/corpDoc/', {
                method: 'POST',
                body: payload,
            });

            if (response.ok) {
                alert('서류 신청이 완료되었습니다.');
                navigate('/myPendingList');
            } else {
                alert('서류 신청에 실패했습니다.');
            }
        } catch (error) {
            console.error('Error submitting form data:', error);
            alert('서류 신청에 실패했습니다.');
        }
    };

    return (
        <div className="content">
            <div className="corpDoc-content">
                <h2>법인서류</h2>
                <Breadcrumb items={['신청하기', '법인서류']} />
                <div className='corpDoc-main'>
                    <div className='corpDoc-apply-content'>
                        <form className='corpDoc-form' onSubmit={handleSubmit}>
                            <div className='corpDoc-bold-label'>
                                <label>법인서류 신청서</label>
                            </div>
                            <div className='corpDoc-form-group'>
                                <label>제출처 <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="text"
                                    name="submission"
                                    value={formData.submission}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className='corpDoc-form-group'>
                                <label>사용목적 <span style={{ color: 'red' }}>*</span></label>
                                <textarea
                                    name="purpose"
                                    value={formData.purpose}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className='corpDoc-form-group'>
                                <label>사용일자 <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="text"
                                    name="useDate"
                                    value={formData.useDate}
                                    onChange={handleChange}
                                    placeholder="YYYY-MM-DD"
                                />
                            </div>
                            <div className='corpDoc-form-group'>
                                <label>원본 / pdf <span style={{ color: 'red' }}>*</span></label>
                                <select 
                                    name="type" 
                                    value={formData.type}
                                    onChange={handleChange}
                                >
                                    <option value="">선택하세요</option>
                                    <option value="original">원본</option>
                                    <option value="pdf">PDF</option>
                                    <option value="both">원본 + PDF</option>
                                </select>
                            </div> &nbsp;
                            <div className='corpDoc-form-group'>
                                <label>필요서류/수량 <span style={{ color: 'red' }}>*</span></label>
                                <div className='corpDoc-form-group-inline'>
                                    <input 
                                        type="checkbox" 
                                        name="document1" 
                                        checked={formData.document1} 
                                        onChange={handleChange} 
                                    />
                                    <label> 법인인감증명서</label>
                                    <div className='corpDoc-form-group-inline-num'>
                                        <label> 수량:</label>
                                        <input 
                                            type="text" 
                                            name="quantity1" 
                                            value={formData.quantity1}
                                            onChange={handleChange}
                                            disabled={!formData.document1}
                                        />
                                        <label> 부</label>
                                    </div>
                                </div>
                                <div className='corpDoc-form-group-inline'>
                                    <input 
                                        type="checkbox" 
                                        name="document2" 
                                        checked={formData.document2} 
                                        onChange={handleChange} 
                                    />
                                    <label> 법인등기사항전부증명서(등기부등본)</label>
                                    <div className='corpDoc-form-group-inline-num'>
                                        <label> 수량:</label>
                                        <input 
                                            type="text" 
                                            name="quantity2" 
                                            value={formData.quantity2}
                                            onChange={handleChange}
                                            disabled={!formData.document2}
                                        />
                                        <label> 부</label>
                                    </div>
                                </div>
                                <div className='corpDoc-form-group-inline'>
                                    <input 
                                        type="checkbox" 
                                        name="document3" 
                                        checked={formData.document3} 
                                        onChange={handleChange} 
                                    />
                                    <label> 사용인감계</label>
                                    <div className='corpDoc-form-group-inline-num'>
                                        <label> 수량:</label>
                                        <input 
                                            type="text" 
                                            name="quantity3" 
                                            value={formData.quantity3}
                                            onChange={handleChange}
                                            disabled={!formData.document3}
                                        />
                                        <label> 부</label>
                                    </div>
                                </div>
                                <div className='corpDoc-form-group-inline'>
                                    <input 
                                        type="checkbox" 
                                        name="document4" 
                                        checked={formData.document4} 
                                        onChange={handleChange} 
                                    />
                                    <label> 위임장</label>
                                    <div className='corpDoc-form-group-inline-num'>
                                        <label> 수량:</label>
                                        <input 
                                            type="text" 
                                            name="quantity4" 
                                            value={formData.quantity4}
                                            onChange={handleChange}
                                            disabled={!formData.document4}
                                        />
                                        <label> 부</label>
                                    </div>
                                </div>
                            </div> &nbsp;
                            <div className='corpDoc-form-group'>
                                <label>근거서류 <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="file"
                                    name="department"
                                    onChange={handleFileChange}
                                />
                            </div>
                            <div className='corpDoc-form-group'>
                                <label>특이사항</label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="corpDoc-apply-button-container">
                                <CustomButton className="apply-request-button" type="submit">
                                    서류 신청하기
                                </CustomButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CorpDocApply;
