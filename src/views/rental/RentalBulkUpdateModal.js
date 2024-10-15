import axios from 'axios';
import PropTypes from 'prop-types';
import { addFormData, formFields } from '../../datas/rentalDatas';
import useRentalChange from '../../hooks/useRentalChange';
import { useDateChange } from '../../hooks/apply/useDateChange';


const RentalBulkUpdateModal = ({ show, onClose, onSave, selectedDetailIds }) => {
  const {handleChange, formData, setFormData} = useRentalChange();
  const [formattedInstallDate, handleInstallDateChange] = useDateChange();
  const [formattedExpiryDate, handleExpiryDateChange] = useDateChange();

  const validateDateFormat = (dateStr) => {
    return /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
  };

  const handleResetFormattedDates = () => {
    handleInstallDateChange({ target: { value: '' } });
    handleExpiryDateChange({ target: { value: '' } });
  };

  const handleClose = () => {
    setFormData(addFormData);
    handleResetFormattedDates();
    onClose();
  };

  const handleSaveClick = async () => {
    const { installDate, expiryDate } = formData;

    if (installDate && !validateDateFormat(installDate)) {
      alert('설치일자는 YYYY-MM-DD 형식으로 입력해 주세요.');
      return;
    }

    if (expiryDate && !validateDateFormat(expiryDate)) {
      alert('만료일자는 YYYY-MM-DD 형식으로 입력해 주세요.');
      return;
    }

    const payload = {
        detailIds: selectedDetailIds,
        ...formData,
    };

    try {
        await axios.put(`/api/rental/bulkUpdate`, payload);
        alert('렌탈 정보가 성공적으로 수정되었습니다.');
        setFormData(addFormData);
        onSave(payload);
        handleResetFormattedDates();
    } catch (error) {
    console.error('렌탈 정보 수정 중 에러 발생:', error);
    alert('렌탈 정보 수정에 실패했습니다.');
    }
  };

  if (!show) return null;

  return (
    <div className="rental-modal-overlay">
      <div className="rental-modal-container">
        <div className="modal-header">
          <h3>렌탈 항목 일괄 수정</h3>
          <button className="rental-close-button" onClick={handleClose}>X</button>
        </div>
        <p className="rental-instructions">일괄 수정할 항목에 내용을 입력하세요.</p>
        <div className="rental-modal-content">
          <div className="rental-add-section">
            {formFields.map((field, index) => (
              <div className="rental-add-detail-row" key={index}>
                <label>{field.label}</label>
                <input
                  type="text"
                  name={field.name}
                  value={
                    field.name === 'installDate' ? formattedInstallDate:
                    field.name === 'expiryDate' ? formattedExpiryDate:
                    ''}
                  onChange={(e) => {
                    if (field.name === 'installDate') {
                        handleInstallDateChange(e);
                    } else if (field.name === 'expiryDate') {
                        handleExpiryDateChange(e);
                    }
                    handleChange(e);
                  }}
                  placeholder={field.placeholder || ''}
                  disabled={field.disabled || false}
                />
                {field.name === 'location' && <span2> 반드시 다음 5가지 항목으로만 기재 &gt;&gt; 사무실, 병원, 임원실, 휴게실, 화장실</span2>}
              </div>
            ))}
          </div>
        </div>
        <div className="rental-modal-buttons">
          <button className="rental-modal-button confirm" onClick={handleSaveClick}>
            수정하기
          </button>
        </div>
      </div>
    </div>
  );
};

RentalBulkUpdateModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  selectedDetailIds: PropTypes.array.isRequired,
};

export default RentalBulkUpdateModal;
