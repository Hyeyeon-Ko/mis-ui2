import React from 'react';
import Breadcrumb from '../../components/common/Breadcrumb';
import CustomButton from '../../components/common/CustomButton';
import corporateSeal from '../../assets/images/corporate_seal.png';
import facsimileSeal from '../../assets/images/facsimile_seal.png';
import companySeal from '../../assets/images/company_seal.png';
import '../../styles/common/Page.css';
import '../../styles/seal/common.css';

function SealFormComponents({
    title, 
    sealType, 
    onSubmit, 
    isExport, 
    sealSelections, 
    handleSealChange, 
    handleQuantityChange, 
    submission, 
    setSubmission, 
    useDate, 
    setUseDate, 
    draftNm, 
    setDraftNm, 
    exportDate, 
    setExportDate, 
    returnDate, 
    setReturnDate, 
    purpose, 
    setPurpose, 
    notes, 
    setNotes, 
    handleFileChange 
}) {
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(e);
    };

    return (
        <div className="content">
            <div className="seal-apply-content">
                <h2>{title}</h2>
                <Breadcrumb items={['신청하기', sealType]} />
                <div className='seal-apply-main'>
                    <div className='seal-apply-form-content'>
                        <form className='seal-apply-form' onSubmit={handleSubmit}>
                            <div className='seal-apply-bold-label'>
                                <label>{`${title} 신청서`}</label>
                            </div>
                            <div className='seal-apply-form-group'>
                                <label>제출처 <span>*</span></label>
                                <input 
                                    type="text" 
                                    name="destination" 
                                    value={submission} 
                                    onChange={(e) => setSubmission(e.target.value)}
                                />
                            </div>

                            {/* 분기 처리로 날인/반출에 따라 다른 필드 출력 */}
                            {isExport ? (
                                <>
                                    <div className='seal-apply-form-group'>
                                        <label>반출자명 <span>*</span></label>
                                        <input 
                                            type="text" 
                                            name="draftNm" 
                                            value={draftNm} 
                                            onChange={(e) => setDraftNm(e.target.value)} 
                                        />
                                    </div>
                                    <div className='seal-apply-form-group'>
                                        <label>반출일자 <span>*</span></label>
                                        <input 
                                            type="text" 
                                            name="exportDate" 
                                            value={exportDate} 
                                            onChange={(e) => setExportDate(e.target.value)} 
                                            placeholder="YYYY-MM-DD" 
                                        />
                                    </div>
                                    <div className='seal-apply-form-group'>
                                        <label>반납일자 <span>*</span></label>
                                        <input 
                                            type="text" 
                                            name="returnDate" 
                                            value={returnDate} 
                                            onChange={(e) => setReturnDate(e.target.value)} 
                                            placeholder="YYYY-MM-DD" 
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className='seal-apply-form-group'>
                                    <label>사용일자 <span>*</span></label>
                                    <input 
                                        type="text" 
                                        name="useDate" 
                                        value={useDate} 
                                        onChange={setUseDate} 
                                        placeholder="YYYY-MM-DD" 
                                    />
                                </div>
                            )}

                            <div className='seal-apply-form-group'>
                                <label>사용목적 <span>*</span></label>
                                <textarea 
                                    name="purpose" 
                                    value={purpose} 
                                    onChange={(e) => setPurpose(e.target.value)} 
                                />
                            </div>

                            <div className='seal-apply-form-group'>
                                <label>인감 구분 <span>*</span></label>
                                <div className="seal-options">
                                    <SealCheckbox
                                        sealName="corporateSeal"
                                        label="법인인감"
                                        imageSrc={corporateSeal}
                                        sealSelections={sealSelections}
                                        handleSealChange={handleSealChange}
                                        handleQuantityChange={handleQuantityChange}
                                    />
                                    <SealCheckbox
                                        sealName="facsimileSeal"
                                        label="사용인감"
                                        imageSrc={facsimileSeal}
                                        sealSelections={sealSelections}
                                        handleSealChange={handleSealChange}
                                        handleQuantityChange={handleQuantityChange}
                                    />
                                    <SealCheckbox
                                        sealName="companySeal"
                                        label="회사인"
                                        imageSrc={companySeal}
                                        sealSelections={sealSelections}
                                        handleSealChange={handleSealChange}
                                        handleQuantityChange={handleQuantityChange}
                                    />
                                </div>
                                <div className="seal-imprint-disclaimer">
                                    *실제 인감이 아닙니다.
                                </div>
                            </div>
                            <div className='seal-apply-form-group'>
                                <label>특이사항</label>
                                <textarea 
                                    name="notes" 
                                    value={notes} 
                                    onChange={(e) => setNotes(e.target.value)} 
                                />
                            </div>
                            {isExport && (
                                <div className='seal-apply-form-group'>
                                    <label>근거서류 <span>*</span></label>
                                    <input 
                                        type="file" 
                                        name="purposeFile" 
                                        className="file-input" 
                                        onChange={handleFileChange} 
                                    />
                                </div>
                            )}

                            <div className="seal-apply-button-container">
                                <CustomButton className="apply-request-button" type="submit">
                                    신청하기
                                </CustomButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SealCheckbox({ sealName, label, imageSrc, sealSelections, handleSealChange, handleQuantityChange }) {
    return (
        <label>
            <div className='seal-apply-detail-option'>
                <div className='seal-apply-detail-left'>
                    <input
                        type="checkbox"
                        name={sealName}
                        checked={sealSelections[sealName].selected}
                        onChange={() => handleSealChange(sealName)}
                    />
                </div>
                <div className='seal-apply-detail-right'>
                    <img src={imageSrc} alt={label} className="seal-image" />
                    <span>{label}</span>
                    <input
                        type="number"
                        name={`${sealName}Quantity`}
                        min="1"
                        placeholder="수량"
                        value={sealSelections[sealName].quantity}
                        onChange={(e) => handleQuantityChange(e, sealName)}
                        disabled={!sealSelections[sealName].selected}
                    />
                </div>
            </div>
        </label>
    );
}

export default SealFormComponents;
