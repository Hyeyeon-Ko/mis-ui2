import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import '../styles/StandardAddModal.css';

const StandardAddModal = ({ show, onClose, onSave, mode, title, selectedCategory, detailData }) => {
  const [detailCode, setDetailCode] = useState('');
  const [detailName, setDetailName] = useState('');
  const [items, setItems] = useState(Array(6).fill(''));
  const [classCode, setClassCode] = useState(selectedCategory);
  const [groupCode, setGroupCode] = useState('');
  const [groupName, setGroupName] = useState('');

  useEffect(() => {
    if (mode === 'group') {
      setClassCode(selectedCategory);
    } else if (mode === 'edit' && detailData) {
      setDetailCode(detailData.detailCd);
      setDetailName(detailData.detailNm);
      setItems([
        detailData.etcItem1,
        detailData.etcItem2,
        detailData.etcItem3,
        detailData.etcItem4,
        detailData.etcItem5,
        detailData.etcItem6,
      ]);
    }
  }, [mode, selectedCategory, detailData]);

  const handleItemChange = (index, value) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  };

  const handleSave = () => {
    if (mode === 'detail' || mode === 'edit') {
      if (!detailCode || !detailName || !items[0]) {
        alert('추가할 정보를 모두 입력해주세요.');
        return;
      }
      onSave({ detailCode, detailName, items });
    } else {
      if (!classCode || !groupCode || !groupName) {
        alert('추가할 정보를 모두 입력해주세요.');
        return;
      }
      onSave({ classCode, groupCode, groupName });
    }
    resetForm();
  };

  const resetForm = () => {
    setDetailCode('');
    setDetailName('');
    setItems(Array(6).fill(''));
    setGroupCode('');
    setGroupName('');
  };

  useEffect(() => {
    if (!show) {
      resetForm();
      if (mode === 'group') {
        setClassCode(selectedCategory);
      }
    }
  }, [show, mode, selectedCategory]);

  if (!show) return null;

  return (
    <div className="standard-modal-overlay">
      <div className="standard-modal-container">
        <h3>{title}</h3>
        <hr className="modal-title-separator" />
        {mode === 'detail' || mode === 'edit' ? (
          <div className="add-standard-details">
            <div className="add-standard-detail-row">
              <label>상세코드</label>
              <input type="text" value={detailCode} onChange={e => setDetailCode(e.target.value)} />
              <hr className="detail-separator" />
            </div>
            <div className="add-standard-detail-row">
              <label>상세명</label>
              <input type="text" value={detailName} onChange={e => setDetailName(e.target.value)} />
              <hr className="detail-separator" />
            </div>
            {items.map((item, index) => (
              <div key={index} className="add-standard-detail-row">
                <label>항목 {index + 1}</label>
                <input type="text" value={item} onChange={e => handleItemChange(index, e.target.value)} />
                {index < items.length - 1 && <hr className="detail-separator" />}
              </div>
            ))}
          </div>
        ) : (
          <div className="add-standard-details">
            <div className="add-standard-detail-row">
              <label>클래스코드</label>
              <input type="text" value={classCode} disabled />
              <hr className="detail-separator" />
            </div>
            <div className="add-standard-detail-row">
              <label>분류코드</label>
              <input type="text" value={groupCode} onChange={e => setGroupCode(e.target.value)} />
              <hr className="detail-separator" />
            </div>
            <div className="add-standard-detail-row">
              <label>분류명</label>
              <input type="text" value={groupName} onChange={e => setGroupName(e.target.value)} />
              <hr className="detail-separator" />
            </div>
          </div>
        )}
        <div className="standard-modal-buttons">
          <button className="standard-modal-button cancel" onClick={onClose}><span>취 소</span></button>
          <button className="standard-modal-button confirm" onClick={handleSave}><span>{mode === 'edit' ? '수 정' : '추 가'}</span></button>
        </div>
      </div>
    </div>
  );
};

StandardAddModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  mode: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  selectedCategory: PropTypes.string.isRequired,
  detailData: PropTypes.object,
};

export default StandardAddModal;
