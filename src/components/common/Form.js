import React, { useState } from 'react';

const Form = ({ init, onSubmit, children }) => {
  const [formData, setFormData] = useState(init);

  // 모든 필드의 상태 변경을 관리하는 핸들러
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'checkbox') {
      setFormData((prevData) => ({ ...prevData, [name]: checked }));
    } else if (type === 'file') {
      setFormData((prevData) => ({ ...prevData, [name]: files[0] })); 
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  // 폼 제출 시 데이터를 부모 컴포넌트로 전달
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {children(formData, handleChange)}
      <div style={{ marginTop: '20px' }}>
      </div>
    </form>
  );
};

export default Form;