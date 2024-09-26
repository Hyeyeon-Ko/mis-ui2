import React, { useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSealForm } from '../../hooks/useSealForm';
import Breadcrumb from '../../components/common/Breadcrumb';
import CustomButton from '../../components/common/CustomButton';
import { AuthContext } from '../../components/AuthContext';
import '../../styles/common/Page.css';
import '../../styles/seal/SealApplyExport.css';
import { SealOption, sealOptions } from '../../datas/sealDatas';


function SealApplyExport() {
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();
    const {sealSelections, file, handleSealChange, handleQuantityChange, handleFileChange} = useSealForm();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const submission = e.target.elements.destination.value.trim();
        const department = e.target.elements.department.value.trim();
        const draftNm = e.target.elements.draftNm.value.trim();
        const exportDate = e.target.elements.exportDate.value.trim();
        const returnDate = e.target.elements.returnDate.value.trim();
        const purpose = e.target.elements.purpose.value.trim();
        
        const selectedSeals = sealOptions.reduce((acc, seal) => {
            acc[seal.name] = sealSelections[seal.name].selected ? sealSelections[seal.name].quantity : '';
            return acc;
        }, {});

        if (Object.values(selectedSeals).every(q => !q)) {
            alert('최소 하나의 인감을 선택해야 합니다.');
            return;
        }

        if (!submission || !department || !draftNm || !exportDate || !returnDate || !purpose) {
            alert('모든 필수 항목을 입력해주세요.');
            return;
        }

        const exportRequestDTO = {
            drafter: auth.hngNm,
            drafterId: auth.userId,
            submission,
            useDept: department,
            expNm: draftNm,
            expDate: exportDate,
            returnDate,
            ...selectedSeals,
            purpose,
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
            navigate('/myPendingList');
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
                                <input type="text" name="destination" required />
                            </div>
                            <div className='seal-export-form-group'>
                                <label>신청부서</label>
                                <input type="text" name="department" required />
                            </div>
                            <div className='seal-export-form-group'>
                                <label>사용용도</label>
                                <textarea name="purpose" required />
                            </div>
                            <div className='seal-imprint-form-group'>
                                <label>인장구분</label>
                                <div className="seal-imprint-options">
                                    {sealOptions.map(seal => (
                                        <SealOption
                                            key={seal.name}
                                            seal={seal}
                                            selection={sealSelections[seal.name]}
                                            onSealChange={handleSealChange}
                                            onQuantityChange={handleQuantityChange}
                                        />
                                    ))}
                                </div>
                                <div className="seal-export-disclaimer">
                                    * 실제 인감이 아닙니다.
                                </div>
                            </div>
                            <div className='seal-export-form-group'>
                                <label>반출자명</label>
                                <input type="text" name="draftNm" required />
                            </div>
                            <div className='seal-export-form-group'>
                                <label>반출일자</label>
                                <input type="text" name="exportDate" placeholder="YYYY-MM-DD" required />
                            </div>
                            <div className='seal-export-form-group'>
                                <label>반납일자</label>
                                <input type="text" name="returnDate" placeholder="YYYY-MM-DD" required />
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
