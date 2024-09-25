import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SealFormComponents from '../../components/apply/SealFormComponents';
import { useSealForm } from '../../hooks/seal/useSealForm';
import { AuthContext } from '../../components/AuthContext';


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

        const corporateSealQuantity = sealSelections.corporateSeal.selected ? sealSelections.corporateSeal.quantity : '';
        const facsimileSealQuantity = sealSelections.facsimileSeal.selected ? sealSelections.facsimileSeal.quantity : '';
        const companySealQuantity = sealSelections.companySeal.selected ? sealSelections.companySeal.quantity : '';

        if (!corporateSealQuantity && !facsimileSealQuantity && !companySealQuantity) {
            alert('최소 하나의 인감을 선택해야 합니다.');
            return;
        }

        if (!submission || !draftNm || !exportDate || !returnDate || !purpose) {
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
            submission,
            useDept: submission,
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