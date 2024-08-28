import React from 'react';
import Breadcrumb from '../../components/common/Breadcrumb';
import CustomButton from '../../components/common/CustomButton';
import '../../styles/common/Page.css';
import '../../styles/corpdoc/CorpDocApply.css';

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
                                <label>사용목적</label>
                                <textarea
                                    name="purpose"
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
                                <div className='corpDoc-form-group-inline'>
                                    <input type="checkbox" name="document2" value="document2" />
                                    <label> 법인인감증명서</label>
                                    <div className='corpDoc-form-group-inline-num'>
                                        <label> 수량:</label>
                                        <input type="text" name="quantity2"/>
                                        <label> 부</label>
                                    </div>
                                </div>
                                <div className='corpDoc-form-group-inline'>
                                    <input type="checkbox" name="document1" value="document1" />
                                    <label> 법인등기사항전부증명서(등기부등본)</label>
                                    <div className='corpDoc-form-group-inline-num'>
                                        <label> 수량:</label>
                                        <input type="text" name="quantity1"/>
                                        <label> 부</label>
                                    </div>
                                </div>
                                <div className='corpDoc-form-group-inline'>
                                    <input type="checkbox" name="document3" value="document3" />
                                    <label> 사용인감계</label>
                                    <div className='corpDoc-form-group-inline-num'>
                                        <label> 수량:</label>
                                        <input type="text" name="quantity3"/>
                                        <label> 부</label>
                                    </div>
                                </div>
                                <div className='corpDoc-form-group-inline'>
                                    <input type="checkbox" name="document4" value="document4" />
                                    <label> 위임장</label>
                                    <div className='corpDoc-form-group-inline-num'>
                                        <label> 수량:</label>
                                        <input type="text" name="quantity4"/>
                                        <label> 부</label>
                                    </div>
                                </div>
                            </div>
                            <div className='corpDoc-form-group'>
                                <label>원본 / pdf</label>
                                <select name="division">
                                    <option value="option">선택하세요</option>
                                    <option value="original">원본</option>
                                    <option value="pdf">pdf</option>
                                    <option value="both">원본 + pdf</option>       value 고치기    
                                </select>
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
