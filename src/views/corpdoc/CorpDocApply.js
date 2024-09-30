import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../components/AuthContext';
import { validateForm } from '../../hooks/validateForm';
import { getTypeName } from '../../hooks/fieldNameUtils';
import Breadcrumb from '../../components/common/Breadcrumb';
import CustomButton from '../../components/common/CustomButton';
import '../../styles/common/Page.css';
import '../../styles/corpdoc/CorpDocApply.css';
import { inputValue } from '../../datas/corpDocDatas';

function CorpDocApply() {
    const navigate = useNavigate();
    const { auth } = useContext(AuthContext); 
    const [formData, setFormData] = useState(inputValue);

    const corpDocGroup = [
        {
            id: 1,
            ckd_name: 'document1',
            checked: formData.document1,
            label: '법인인감증명서',
            qt_name: 'quantity1',
            quantity: formData.quantity1,
        },
        {
            id: 1,
            ckd_name: 'document2',
            checked: formData.document2,
            label: '법인등기사항전부증명서(등기부등본)',
            qt_name: 'quantity2',
            quantity: formData.quantity2,
        },
        {
            id: 1,
            ckd_name: 'document3',
            checked: formData.document3,
            label: '사용인감계',
            qt_name: 'quantity3',
            quantity: formData.quantity3,
        },
        {
            id: 1,
            ckd_name: 'document4',
            checked: formData.document4,
            label: '위임장',
            qt_name: 'quantity4',
            quantity: formData.quantity4,
        },
    
    ]
    

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

    const handleSubmit = async (e, formData) => {
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
                                <label>필요서류/수량</label>
                                {corpDocGroup.map((doc) => (
                                <div className='corpDoc-form-group-inline' key={doc.id}>
                                    <input
                                        type="checkbox"
                                        name={doc.ckd_name}
                                        checked={doc.checked}
                                        onChange={handleChange}
                                    />
                                    <label>{doc.label}</label>
                                    <div className='corpDoc-form-group-inline-num'>
                                        <label>수량:</label>
                                        <input
                                            type="text"
                                            name={doc.qt_name}
                                            value={doc.quantity}
                                            onChange={handleChange}
                                            disabled={!doc.checked}
                                        />
                                        <label>부</label>
                                    </div>
                                </div>
                            ))}
                            </div> 
                            &nbsp;
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
