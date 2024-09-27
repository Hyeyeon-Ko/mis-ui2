import React, { useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import { useSealForm } from '../../hooks/useSealForm';
import Breadcrumb from '../../components/common/Breadcrumb';
import CustomButton from '../../components/common/CustomButton';
import { AuthContext } from '../../components/AuthContext';
import '../../styles/common/Page.css';
import '../../styles/seal/SealApplyImprint.css';
import { SealCheckbox, sealImages } from '../../datas/sealDatas';

function SealApplyImprint() {
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();
    const { sealSelections, handleSealChange, handleQuantityChange } = useSealForm();

    const handleSubmit = (e) => {
        e.preventDefault();

        const submission = e.target.elements.destination.value.trim();
        const useDate = e.target.elements.useDate.value.trim();
        const purpose = e.target.elements.purpose.value.trim();
    
        const selectedSeals = Object.fromEntries(
            Object.entries(sealSelections).map(([key, { selected, quantity }]) => [key, selected ? quantity : ''])
        );

        if (!Object.values(selectedSeals).some(quantity => quantity)) {
            alert('최소 하나의 인감을 선택해야 합니다.');
            return;
        }

        const imprintRequestDTO = {
            drafter: auth.hngNm,
            drafterId: auth.userId,
            submission,
            useDate,
            purpose,
            notes: e.target.elements.notes.value,
            instCd: auth.instCd,
            ...selectedSeals,
        };
    
        axios.post('/api/seal/imprint', imprintRequestDTO)
            .then(() => {
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
                                <input type="text" name="destination" required />
                            </div>
                            <div className='seal-imprint-form-group'>
                                <label>사용일자</label>
                                <input type="text" name="useDate" required placeholder="YYYY-MM-DD" />
                            </div>
                            <div className='seal-imprint-form-group'>
                                <label>사용목적</label>
                                <textarea name="purpose" required />
                            </div>
                            <div className='seal-imprint-form-group'>
                                <label>인장구분</label>
                                <div className="seal-imprint-options">
                                    {Object.keys(sealImages).map(sealName => (
                                        <SealCheckbox
                                            key={sealName}
                                            sealName={sealName}
                                            sealData={sealSelections[sealName]}
                                            onSealChange={handleSealChange}
                                            onQuantityChange={handleQuantityChange}
                                        />
                                    ))}
                                </div>
                                <div className="seal-imprint-disclaimer">
                                    * 실제 인감이 아닙니다.
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