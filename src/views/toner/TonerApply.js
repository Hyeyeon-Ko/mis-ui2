import React, { useState } from 'react';
import Breadcrumb from '../../components/common/Breadcrumb';
import CustomButton from '../../components/common/CustomButton';
import '../../styles/common/Page.css';
import '../../styles/toner/TonerApply.css';

function TonerApplyFirst() {
  const [formData, setFormData] = useState({
    dept: '',
    team: '',
    location: '',
    printer: '',
    toner: '',
    quantity: 1,
  });

  const [tableData, setTableData] = useState([]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTableData([...tableData, formData]);
    setFormData({
      dept: '',
      team: '',
      location: '',
      printer: '',
      toner: '',
      quantity: 1,
    });
  };

  return (
    <div className="content">
      <div className="apply-document-content">
        <h2>토너 신청</h2>
        <Breadcrumb items={['신청하기', '토너신청']} />
        <div className="toner-form-wrapper">
          <div className='toner-apply-content'>
            <form className='toner-form' onSubmit={handleSubmit}>
              <div className='toner-form-group'>
                <label>부서 선택</label>
                <select 
                  name="dept"
                  value={formData.dept}
                  onChange={handleChange}
                  required
                >
                  <option value="">선택하세요</option>
                  <option value="부서A">부서 A</option>
                  <option value="부서B">부서 B</option>
                </select>
              </div>
              <div className='toner-form-group'>
                <label>팀 선택</label>
                <select 
                  name="team"
                  value={formData.team}
                  onChange={handleChange}
                  required
                >
                  <option value="">선택하세요</option>
                  <option value="팀A">팀 A</option>
                  <option value="팀B">팀 B</option>
                </select>
              </div>
              <div className='toner-form-group'>
                <label>위치</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className='toner-form-group'>
                <label>프린트 선택</label>
                <select 
                  name="printer"
                  value={formData.printer}
                  onChange={handleChange}
                  required
                >
                  <option value="">선택하세요</option>
                  <option value="printerA">printer A</option>
                  <option value="printerB">printer B</option>
                </select>
              </div>
              <div className='toner-form-group'>
                <label>토너 선택</label>
                <select 
                  name="toner"
                  value={formData.toner}
                  onChange={handleChange}
                  required
                >
                  <option value="">선택하세요</option>
                  <option value="tonerA">toner A</option>
                  <option value="tonerB">toner B</option>
                </select>
              </div>
              <div className='toner-form-group'>
                <label>수량</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="button-group">
                <CustomButton className="data-reset-button" type="reset">
                  초기화
                </CustomButton>
                <CustomButton className="add-button" type="submit">
                  추 가
                </CustomButton>
              </div>
            </form>
          </div>
          <div className="toner-apply-list">
            <h3>신청 내역</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>부서</th>
                  <th>팀</th>
                  <th>위치</th>
                  <th>프린트</th>
                  <th>토너</th>
                  <th>수량</th>
                  <th>수정</th>
                  <th>삭제</th>
                </tr>
              </thead>
              <tbody>
                {tableData.length > 0 ? (
                  tableData.map((data, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{data.dept}</td>
                      <td>{data.team}</td>
                      <td>{data.location}</td>
                      <td>{data.printer}</td>
                      <td>{data.toner}</td>
                      <td>{data.quantity}</td>
                      <td></td>
                      <td></td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center' }}>데이터가 없습니다</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TonerApplyFirst;
