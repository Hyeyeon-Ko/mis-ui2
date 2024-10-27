import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import '../../styles/standard/StandardAddModal.css';
import useStandardChange from '../../hooks/useStandardChange';

const StandardAddModal = ({ show, onClose, onSave, mode, title, selectedCategory, detailData }) => {
  const [detailCode, setDetailCode] = useState('');
  const [detailName, setDetailName] = useState('');
  const [classCd, setClassCode] = useState(selectedCategory);
  const [classNm, setClassName] = useState('');
  const [groupCd, setGroupCode] = useState('');
  const [groupNm, setGroupName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const {items, setItems, handleItemChange, handleAddItem} = useStandardChange();

  useEffect(() => {
    if (mode === 'group') {
      setClassCode(selectedCategory);
    } else if ((mode === 'edit' || mode === 'detail') && detailData) {
      setDetailCode(detailData?.detailCd || '');
      setDetailName(detailData?.detailNm || '');
      const initialItems = [
        detailData?.etcItem1 || '',
        detailData?.etcItem2 || '',
        detailData?.etcItem3 || '',
        detailData?.etcItem4 || '',
        detailData?.etcItem5 || '',
        detailData?.etcItem6 || '',
        detailData?.etcItem7 || '',
        detailData?.etcItem8 || '',
        detailData?.etcItem9 || '',
        detailData?.etcItem10 || '',
        detailData?.etcItem11 || '',
      ].filter(item => item !== null && item !== '');
      setItems(initialItems.map(item => ({ value: item })));
    }
  }, [mode, selectedCategory, detailData, setItems]);

  const handleSave = () => {
    if (mode === 'detail' || mode === 'edit') {
      if (
        detailCode === detailData?.detailCd &&
        detailName === detailData?.detailNm &&
        items.every((item, index) => item.value === detailData?.[`etcItem${index + 1}`])
      ) {
        alert('수정된 내용이 없습니다.');
        return;
      }
  
      if (!detailCode || !detailName) {
        alert('추가할 정보를 모두 입력해주세요.');
        return;
      }
  
      const normalizedItems = Array.from({ length: 11 }, (_, index) => items[index]?.value || '');
  
      onSave({ detailCode, detailName, items: normalizedItems });
    } else if (mode === 'class') {
      if (!classCd || !classNm) {
        alert('추가할 정보를 모두 입력해주세요.');
        return;
      }
      onSave({ classCd, classNm });
    } else {
      if (!classCd || !groupCd || !groupNm) {
        alert('추가할 정보를 모두 입력해주세요.');
        return;
      }
      onSave({ classCd, groupCd, groupNm });
    }
  };
    
  const resetForm = useCallback(() => {
    setDetailCode('');
    setDetailName('');
    setItems([]);
    setGroupCode('');
    setGroupName('');
    setClassCode('');
    setClassName('');
  }, [setItems]);  

  useEffect(() => {
    if (!show) {
      resetForm();
      if (mode === 'group') {
        setClassCode(selectedCategory);
      }
    }
  }, [show, mode, selectedCategory, resetForm]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setOffset({
      x: e.clientX - e.currentTarget.getBoundingClientRect().left,
      y: e.clientY - e.currentTarget.getBoundingClientRect().top,
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      e.currentTarget.style.left = `${e.clientX - offset.x}px`;
      e.currentTarget.style.top = `${e.clientY - offset.y}px`;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!show) return null;

  return (
    <div className="standard-modal-overlay">
      <div
        className="standard-modal-container"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="standard-close-button" onClick={onClose}>X</button>
        </div>
        <hr className="modal-title-separator" />
        {mode === 'detail' || mode === 'edit' ? (
          <div className="add-standard-details">
            <div className="add-standard-detail-row">
              <label>상세코드</label>
              <input
                type="text"
                value={detailCode}
                onChange={e => setDetailCode(e.target.value)}
                disabled={detailCode === "000"}
              />
              <hr className="detail-separator" />
            </div>
            <div className="add-standard-detail-row">
              <label>상세명</label>
              <input type="text" value={detailName} onChange={e => setDetailName(e.target.value)} />
              <hr className="detail-separator" />
            </div>
            {items.map((item, index) => {
              return (
                <div key={index} className="add-standard-detail-row">
                  <label>항목 {index + 1}</label>
                  <input type="text" value={item.value} onChange={e => handleItemChange(index, e.target.value)} />
                  {index <= items.length - 1 && <hr className="detail-separator" />}
                </div>
              );
            })}
            {items.length < 11 && (
              <div className="add-standard-detail-row">
                <button className="add-item-button" onClick={handleAddItem}>+</button>
              </div>
            )}
          </div>
        ) : mode === 'class' ? (
          <div className="add-standard-details">
            <div className="add-standard-detail-row">
              <label>대분류코드</label>
              <input type="text" value={classCd} onChange={e => setClassCode(e.target.value)} />
              <hr className="detail-separator" />
            </div>
            <div className="add-standard-detail-row">
              <label>대분류명</label>
              <input type="text" value={classNm} onChange={e => setClassName(e.target.value)} />
              <hr className="detail-separator" />
            </div>
          </div>
        ) : (
          <div className="add-standard-details">
            <div className="add-standard-detail-row">
              <label>클래스코드</label>
              <input type="text" value={classCd} disabled />
              <hr className="detail-separator" />
            </div>
            <div className="add-standard-detail-row">
              <label>분류코드</label>
              <input type="text" value={groupCd} onChange={e => setGroupCode(e.target.value)} />
              <hr className="detail-separator" />
            </div>
            <div className="add-standard-detail-row">
              <label>분류명</label>
              <input type="text" value={groupNm} onChange={e => setGroupName(e.target.value)} />
              <hr className="detail-separator" />
            </div>
          </div>
        )}
        <div className="standard-modal-buttons">
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
