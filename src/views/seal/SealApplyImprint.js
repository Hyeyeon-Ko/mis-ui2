import React, { useContext, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../components/AuthContext';
import { validateForm } from '../../hooks/validateForm';
import SealFormComponents from '../../components/apply/SealFormComponents';
import { useSealForm } from '../../hooks/useSealForm';
import { useDateChange } from '../../hooks/apply/useDateChange';


function SealApplyImprint() {
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();
    const { sealSelections, handleSealChange, handleQuantityChange } = useSealForm();
        
    const [submission, setSubmission] = useState('');
    const [purpose, setPurpose] = useState('');
    const [notes, setNotes] = useState('');

    const [useDate, handleUseDateChange] = useDateChange();
    
    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. SealForm validation
        const requiredInputs = {
            submission: submission,
            useDate: useDate,
            purpose: purpose,
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
            useDate: useDate
        }

        const { isValid, message } = validateForm('Seal', requiredInputs, selectedSeals, inputDates);
        if (!isValid) {
            alert(message);
            return;
        }

        // 2. Submit SealForm
        const imprintRequestDTO = {
            drafter: auth.userNm,
            drafterId: auth.userId,
            submission,
            useDate,
            corporateSeal: selectedSeals.corporateSeal.quantity,
            facsimileSeal: selectedSeals.facsimileSeal.quantity,
            companySeal: selectedSeals.companySeal.quantity,
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
            setUseDate={handleUseDateChange}
            purpose={purpose}
            setPurpose={setPurpose}
            notes={notes}
            setNotes={setNotes}
        />

    );
}

export default SealApplyImprint;