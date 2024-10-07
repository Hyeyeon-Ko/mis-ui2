import React, { useEffect, useContext, useCallback } from 'react';
import '../../styles/seal/SealRegistrationAddModal.css';
import axios from 'axios';
import { AuthContext } from '../../components/AuthContext';
import { useSealForm } from '../../hooks/useSealForm';
import { validateForm } from '../../hooks/validateForm';

function SealRegistrationUpdateModal({ isOpen, onClose, onSave, draftId }) {
  const { formData, setFormData, handleUpdateChange, handleFileUpdateChange } = useSealForm();
  const { auth } = useContext(AuthContext);
  const { setIsFileDeleted } = useSealForm();

  const fetchSealDetail = useCallback(async (id) => {
    try {
      const response = await axios.get(`/api/seal/register/${id}`);
      console.log(response);
      if (response.data.code === 200) {
        const data = response.data.data;
        setFormData({
          seal: data.sealNm,
          sealImage: data.sealImage,
          department: data.useDept,
          purpose: data.purpose,
          manager: data.manager,
          subManager: data.subManager,
          date: data.draftDate,
        });
        setIsFileDeleted(false);
      } else {
        alert('데이터를 불러오는 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Error fetching seal detail:', error);
      alert('데이터를 불러오는 중 오류가 발생했습니다.');
    }
  }, [setIsFileDeleted, setFormData]);

  useEffect(() => {
    if (draftId) {
      fetchSealDetail(draftId);
    }
  }, [draftId, fetchSealDetail]);

  const handleDeleteFile = () => {
    setFormData((prev) => ({
      ...prev,
      sealImage: null,
    }));
    setIsFileDeleted(true);
  };

  const handleSave = async () => {
    const data = new FormData();
    data.append('sealUpdateRequestDTO', new Blob([JSON.stringify({
      sealNm: formData.seal,
      useDept: formData.department,
      purpose: formData.purpose,
      manager: formData.manager,
      subManager: formData.subManager,
      drafterId: auth.userId,
      draftDate: formData.date,
      instCd: auth.instCd,
    })], { type: 'application/json' }));
    data.append('sealImage', formData.sealImage);

    // SealRegistForm validation
    const requiredInputs = {
      sealNm: formData.seal,
      sealImage: formData.sealImage,
      useDept: formData.department,
      usage: formData.purpose,
      manager: formData.manager,
      subManager: formData.subManager,
      draftDate: formData.date
    }

    const inputDates = {
      draftDate: formData.date
    }

    const { isValid, message } = validateForm('SealRegist', requiredInputs, '', inputDates);
    if (!isValid) {
        alert(message);
        return;
    }

    try {
      const response = await axios.post(`/api/seal/register/update`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        params: { draftId },
      });

      if (response.status === 200) {
        alert('인장 정보가 수정되었습니다.');
        onSave();
        onClose();
      } else {
        alert('인장 정보 수정 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Error during seal update:', error);
      alert('인장 정보 수정 중 오류가 발생했습니다.');
    }
  };

  if (!isOpen) return null;

  const sealRegistFields = [
    {
      label: (
        <>
          인영 종류 <span style={{ color: 'red' }}>*</span>
        </>
      ),
      name: 'seal',
      type: 'text',
      placeholder: '인영 종류를 입력하세요',
    },
    {
      label: (
        <>
          인영 이미지 <span style={{ color: 'red' }}>*</span>
        </>
      ),
      type: 'file',
      onChange: handleFileUpdateChange,
    },
    {
      label: (
        <>
          사용부서 <span style={{ color: 'red' }}>*</span>
        </>
      ),
      name: 'department',
      type: 'text',
      placeholder: '사용부서를 입력하세요',
    },
    {
      label: (
        <>
          용도 <span style={{ color: 'red' }}>*</span>
        </>
      ),
      name: 'purpose',
      type: 'text',
      placeholder: '용도를 입력하세요',
    },
    {
      label: (
        <>
          관리자(정) <span style={{ color: 'red' }}>*</span>
        </>
      ),
      name: 'manager',
      type: 'text',
      placeholder: '정 관리자의 이름을 입력하세요',
    },
    {
      label: (
        <>
          관리자(부) <span style={{ color: 'red' }}>*</span>
        </>
      ),
      name: 'subManager',
      type: 'text',
      placeholder: '부 관리자의 이름을 입력하세요',
    },
    {
      label: (
        <>
          등록일자 <span style={{ color: 'red' }}>*</span>
        </>
      ),
      name: 'date',
      type: 'text',
    },
  ];

  return (
    <div className="seal-regist-overlay">
      <div className="seal-regist-container">
        <div className="seal-regist-header">
          <h3>인장 정보 수정</h3>
          <button className="seal-regist-close-button" onClick={onClose}>X</button>
        </div>
        <div className="seal-regist-content">
          <div className="seal-regist-section">
            {sealRegistFields.map((field, index) => (
              <div className="seal-regist-detail-row" key={index}>
                <label>{field.label}</label>
                {field.type === 'file' ? (
                  <>
                    {/* 파일 제목 표시 */}
                    {formData.sealImage ? (
                      <div>
                        <span>{formData.sealImageNm || 'Uploaded Image'}</span>
                        <button onClick={handleDeleteFile}>기존 파일 삭제</button>
                      </div>
                    ) : (
                      <input type="file" onChange={handleFileUpdateChange} />
                    )}
                  </>
                ) : (
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleUpdateChange}
                    placeholder={field.placeholder}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="seal-regist-buttons">
          <button
            className="seal-regist-button confirm"
            onClick={handleSave}
          >
            수정
          </button>
          <button
            className="seal-regist-button cancel"
            onClick={onClose}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}

export default SealRegistrationUpdateModal;