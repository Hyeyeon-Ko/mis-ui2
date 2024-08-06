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
                <Breadcrumb items={['신청하기', '인장신청']} />
                <div className='seal-main'>
                    <div className='seal-apply-content'>
                        <form className='seal-form'>
                            <div className='seal-bold-label'>
                                <label>인장 날인 신청서</label>
                            </div>
                            <div className='seal-form-group'>
                                <label>제출처</label>
                                <input
                                    type="text"
                                    name="destination"
                                />
                            </div>
                            <div className='seal-form-group'>
                                <label>사용일자</label>
                                <input
                                    type="text"
                                    name="useDate"
                                />
                            </div>
                            <div className='seal-form-group'>
                                <label>인장구분</label>
                                <select name="seal">
                                    <option value="document1">선택하세요</option>
                                    <option value="document1">법인인감</option>
                                    <option value="document2">사용인감</option>                        
                                    <option value="document2">회사인감</option>                        
                                </select>
                            </div>
                            <div className='seal-form-group'>
                                <label>날인부수</label>
                                <select name="quantity">
                                    <option value="document1">선택하세요</option>
                                    <option value="document1">아직</option>
                                    <option value="document2">뭐가</option>
                                    <option value="document2">들어</option>
                                    <option value="document2">갈지</option>
                                    <option value="document3">몰라!</option>
                                </select>
                            </div>
                            <div className='seal-form-group'>
                                <label>사용목적</label>
                                <textarea
                                    name="purpose"
                                />
                            </div>
                            <div className='seal-form-group'>
                                <label>특이사항</label>
                                <textarea
                                    name="notes"
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
