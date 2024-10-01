import axios from 'axios';
import PropTypes from 'prop-types';
import { addFormData } from '../../datas/rentalDatas';
import useRentalChange from '../../hooks/useRentalChange';



const RentalBulkUpdateModal = ({ show, onClose, onSave, selectedDetailIds }) => {
  const {handleChange, formData, setFormData} = useRentalChange();
  // const [formData, setFormData] = useState(addFormData);

  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   setFormData({
  //     ...formData,
  //     [name]: value,
  //   });
  // };

  const validateDateFormat = (dateStr) => {
    return /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
  };

  const handleClose = () => {
    setFormData(addFormData);
    onClose(); // 모달을 닫는 함수 호출
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
            {[
              { label: '제품군', name: 'category' },
              { label: '업체명', name: 'companyNm' },
              { label: '계약번호', name: 'contractNum', disabled: true },
              { label: '모델명', name: 'modelNm' },
              { label: '설치일자', name: 'installDate', placeholder: 'YYYY-MM-DD' },
              { label: '만료일자', name: 'expiryDate', placeholder: 'YYYY-MM-DD' },
              { label: '렌탈료', name: 'rentalFee' },
              { label: '위치분류', name: 'location' },
              { label: '설치위치', name: 'installationSite' },
              { label: '특이사항', name: 'specialNote' },
            ].map((field, index) => (
              <div className="rental-add-detail-row" key={index}>
                <label>{field.label}</label>
                <input
                  type="text"
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder || ''}
                  disabled={field.disabled || false}
                />
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
