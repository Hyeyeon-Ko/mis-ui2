export const RentalFormFields = ({ formData, handleChange, disabledFields = [] }) => {
    const formFields = [
        { label: '제품군', name: 'category', type: 'text' },
        { label: '업체명', name: 'companyNm', type: 'text' },
        { label: '계약번호', name: 'contractNum', type: 'text' },
        { label: '모델명', name: 'modelNm', type: 'text' },
        { label: '설치일자', name: 'installDate', type: 'text', placeholder: 'YYYY-MM-DD' },
        { label: '만료일자', name: 'expiryDate', type: 'text', placeholder: 'YYYY-MM-DD' },
        { label: '렌탈료', name: 'rentalFee', type: 'text' },
        { label: '위치분류', name: 'location', type: 'text' },
        { label: '설치장소', name: 'installationSite', type: 'text' },
        { label: '특이사항', name: 'specialNote', type: 'text' }
    ];
    
    return (
        <>
            {formFields.map((field) => (
            <div className="rental-add-detail-row" key={field.name}>
                <label>{field.label}</label>
                <input
                type={field.type}
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder || ''}
                disabled={disabledFields.includes(field.name)}
                />
            </div>
            ))}
        </>
    );
};

export const RentalModalTemplate = ({ title, onClose, onSave, children }) => {
    return (
      <div className="rental-modal-overlay">
        <div className="rental-modal-container">
          <div className="modal-header">
            <h3>{title}</h3>
            <button className="rental-close-button" onClick={onClose}>X</button>
          </div>
          <div className="rental-modal-content">
            {children}
          </div>
          <div className="rental-modal-buttons">
            <button className="rental-modal-button confirm" onClick={onSave}>
              저장하기
            </button>
          </div>
        </div>
      </div>
    );
  };