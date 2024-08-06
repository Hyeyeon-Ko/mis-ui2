import React from 'react';
import Breadcrumb from '../components/common/Breadcrumb';
import CustomButton from '../components/common/CustomButton';
import '../styles/common/Page.css';
import '../styles/SealApplyImprint.css';

function SealApplyImprint() {
    return (
        <div className="content">
            <div className="seal-content">
                <h2>인장신청</h2>
                <Breadcrumb items={['신청하기', '인장관리']} />
                <div className='seal-main'>
                    <div className='seal-apply-content'>
                        <form className='seal-form'>
                            <div className='seal-bold-label'>
                                <label>인장 반출 신청서</label>
                            </div>
                            <div className='seal-form-group'>
                                <label>제출처</label>
                                <input
                                    type="text"
                                    name="destination"
                                />
                            </div>
                            <div className='seal-form-group'>
                                <label>신청부서</label>
                                <input
                                    type="text"
                                    name="department"
                                />
                            </div>
                            <div className='seal-form-group'>
                                <label>반출자명</label>
                                <input
                                    type="text"
                                    name="draftNm"
                                />
                            </div>
                            <div className='seal-form-group'>
                                <label>반출일자</label>
                                <input
                                    type="text"
                                    name="exportDate"
                                />
                            </div>
                            <div className='seal-form-group'>
                                <label>반납일자</label>
                                <input
                                    type="text"
                                    name="returnDate"
                                />
                            </div>
                            <div className='seal-form-group'>
                                <label>반출인감</label>
                                <select name="seal">
                                    <option value="document1">선택하세요</option>
                                    <option value="document1">법인인감</option>
                                    <option value="document2">사용인감</option>                        
                                    <option value="document2">회사인감</option>                        
                                </select>
                            </div>
                            <div className='seal-form-group'>
                                <label>사용용도</label>
                                <textarea
                                    name="purpose"
                                />
                            </div>
                            <div className="seal-apply-button-container">
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

export default SealApplyImprint;
