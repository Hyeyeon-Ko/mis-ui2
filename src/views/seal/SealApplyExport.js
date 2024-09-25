import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SealFormComponents from '../../components/apply/SealFormComponents';
import { useSealForm } from '../../hooks/seal/useSealForm';
import { AuthContext } from '../../components/AuthContext';
import { validateForm } from '../../hooks/validateForm';


function SealApplyExport() {
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();
    const { sealSelections, handleSealChange, handleQuantityChange } = useSealForm();

    // 상태 관리
    const [submission, setSubmission] = useState('');
    const [draftNm, setDraftNm] = useState('');
    const [exportDate, setExportDate] = useState('');
    const [returnDate, setReturnDate] = useState('');
    const [purpose, setPurpose] = useState('');
    const [notes, setNotes] = useState('');
    const [file, setFile] = useState(null);

    // 파일 선택 핸들러
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    // 폼 제출 핸들러
    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. SealForm Validation
        const requiredInputs = {
            submission: submission,
            expNm: draftNm,
            exportDate: exportDate,
            returnDate: returnDate,
            purpose: purpose,
            file: file,
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
            exportDate: exportDate,
            returnDate: returnDate
        }

        const { isValid, message } = validateForm('Seal', requiredInputs, selectedSeals, inputDates);
        if (!isValid) {
            alert(message);
            return;
        }

        const exportRequestDTO = {
            drafter: auth.hngNm,
            drafterId: auth.userId,
            submission,
            useDept: submission,
            expNm: draftNm,
            expDate: exportDate,
            returnDate: returnDate,
            corporateSeal: selectedSeals.corporateSeal.quantity,
            facsimileSeal: selectedSeals.facsimileSeal.quantity,
            companySeal: selectedSeals.companySeal.quantity,
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
            navigate('/myPendingList');
        } catch (error) {
            console.error('Error:', error);
            alert('반출 신청 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
    };
        
    return (
        <SealFormComponents
            title="인장 반출"
            sealType="반출"
            onSubmit={handleSubmit}
            isExport={true}
            sealSelections={sealSelections}
            handleSealChange={handleSealChange}
            handleQuantityChange={handleQuantityChange}
            submission={submission}
            setSubmission={setSubmission}
            draftNm={draftNm}
            setDraftNm={setDraftNm}
            exportDate={exportDate}
            setExportDate={setExportDate}
            returnDate={returnDate}
            setReturnDate={setReturnDate}
            purpose={purpose}
            setPurpose={setPurpose}
            notes={notes}
            setNotes={setNotes}
            handleFileChange={handleFileChange}
        />
    );
}

export default SealApplyExport;