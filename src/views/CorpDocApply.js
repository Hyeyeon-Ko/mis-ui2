import React from 'react';
import Breadcrumb from '../components/common/Breadcrumb';
import CustomButton from '../components/common/CustomButton';
import '../styles/common/Page.css';
import '../styles/CorpDocApply.css';

function CorpDocApply() {
    return (
        <div className="content">
            <div className="corpDoc-content">
                <h2>법인서류</h2>
                <Breadcrumb items={['신청하기', '법인서류']} />
                <div className='corpDoc-main'>
                    <div className='corpDoc-apply-content'>
                        <form className='corpDoc-form'>
                            <div className='corpDoc-bold-label'>
                                <label>법인서류 신청서</label>
                            </div>
                            <div className='corpDoc-form-group'>
                                <label>제출처</label>
                                <input
                                    type="text"
                                    name="destination"
                                />
                            </div>
                            <div className='corpDoc-form-group'>
                                <label>사용일자</label>
                                <input
                                    type="text"
                                    name="useDate"
                                />
                            </div>
                            <div className='corpDoc-form-group'>
                                <label>증빙서류</label>
                                <input
                                    type="file"
                                    name="department"
                                />
                            </div>
                            <div className='corpDoc-form-group'>
                                <label>필요서류/수량</label>
                                <select name="quantity">
                                  <option value="document1">선택하세요</option>
                                  <option value="document1">1</option>
                                  <option value="document2">2</option>                        
                                  <option value="document2">3</option>                        
                                </select>
                            </div>
                            <div className='corpDoc-form-group'>
                                <label>원본/PDF</label>
                                <select name="division">
                                    <option value="option">선택하세요</option>
                                    <option value="original">원본</option>
                                    <option value="pdf">PDF</option>                        
                                </select>
                            </div>
                            <div className='corpDoc-form-group'>
                                <label>사용목적</label>
                                <textarea
                                    name="purpose"
                                />
                            </div>
                            <div className='corpDoc-form-group'>
                                <label>특이사항</label>
                                <textarea
                                    name="notes"
                                />
                            </div>
                            <div className="corpDoc-apply-button-container">
                                <CustomButton className="apply-request-button" type="submit">
                                    서류 신청하기
                                </CustomButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CorpDocApply;
