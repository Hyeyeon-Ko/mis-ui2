import React, { useContext, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../components/AuthContext';
import { useSealForm } from '../../hooks/seal/useSealForm';
import SealFormComponents from '../../components/apply/SealFormComponents';

function SealApplyImprint() {
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();
    const { sealSelections, handleSealChange, handleQuantityChange } = useSealForm();
        
    const [submission, setSubmission] = useState('');
    const [useDate, setUseDate] = useState('');
    const [purpose, setPurpose] = useState('');
    const [notes, setNotes] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        const corporateSealQuantity = sealSelections.corporateSeal.selected ? sealSelections.corporateSeal.quantity : '';
        const facsimileSealQuantity = sealSelections.facsimileSeal.selected ? sealSelections.facsimileSeal.quantity : '';
        const companySealQuantity = sealSelections.companySeal.selected ? sealSelections.companySeal.quantity : '';

        if (!corporateSealQuantity && !facsimileSealQuantity && !companySealQuantity) {
            alert('최소 하나의 인감을 선택해야 합니다.');
            return;
        }

        if (!submission || !useDate || !purpose) {
            alert('모든 필수 항목을 입력해주세요.');
            return;
        }

        const selectedSeals = {
            corporateSeal: corporateSealQuantity,
            facsimileSeal: facsimileSealQuantity,
            companySeal: companySealQuantity,
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
            notes,
            instCd: auth.instCd,
        };

        try {
            await axios.post('/api/seal/imprint', imprintRequestDTO);
            alert('인장 날인 신청이 완료되었습니다.');
            navigate('/myPendingList');
        } catch (error) {
            console.error('Error:', error);
            alert('날인 신청 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
    };

        
    return (
        <SealFormComponents
            title="인장 날인"
            sealType="날인"
            onSubmit={handleSubmit}
            sealSelections={sealSelections}
            handleSealChange={handleSealChange}
            handleQuantityChange={handleQuantityChange}
            submission={submission}
            setSubmission={setSubmission}
            useDate={useDate}
            setUseDate={setUseDate}
            purpose={purpose}
            setPurpose={setPurpose}
            notes={notes}
            setNotes={setNotes}
        />

    );
}

export default SealApplyImprint;
