import React, { useEffect, useState } from 'react';
import Breadcrumb from '../components/common/Breadcrumb';
import '../styles/StandardData.css';
import axios from 'axios';

/* 기준자료 페이지 */
function StandardData() {
    const [subCategories, setSubCategories] = useState([]);            // 즁분류 코드 리스트 상태 관리
    const [details, setDetails] = useState([]);                      // 상세 데이터 리스트 상태 관리
    const [selectedCategory, setSelectedCategory] = useState('A');   // 선택된 대분류 코드 상태 관리, default 'A'
    const [selectedSubCategory, setSelectedSubCategory] = useState('');  // 선택된 중분류 코드 상태 관리

    const categories = [
        { categoryCode: 'A', categoryName: '공통' },
        { categoryCode: 'B', categoryName: '권한' },
    ];

    // 대분류코드 변경 시 중분류코드 및 상세코드 업데이트
    useEffect(() => {
        if (selectedCategory) {
            fetchSubCategories(selectedCategory);
        }
    }, [selectedCategory]);

    // 중분류코드 변경 시 상세 데이터 호출 위함
    useEffect(() => {
        if (selectedSubCategory) {
            fetchDetails(selectedSubCategory);
        }
    }, [selectedSubCategory]);

    // 중분류 코드를 API로부터 불러오는 함수
    const fetchSubCategories = async (classCd) => {
        try {
            const response = await axios.get('/api/std/groupInfo', { params: { classCd } });
            const data = response.data || [];
            setSubCategories(Array.isArray(data) ? data : []);
            if (Array.isArray(data) && data.length > 0) {
                setSelectedSubCategory(data[0].groupCd); // 첫 번째 중분류 코드를 기본값으로 설정
            } else {
                setSelectedSubCategory('');
            }
        } catch (error) {
            console.error('Error fetching sub-categories:', error.response ? error.response.data : error.message);
            setSubCategories([]);
            setSelectedSubCategory('');
        }
    };

    // 상세 데이터를 API로부터 불러오는 함수
    const fetchDetails = async (groupCd) => {
        try {
            const response = await axios.get(`/api/std/detailInfo`, { params: { groupCd } });
            const data = response.data || [];
            setDetails(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching details:', error);
            setDetails([]);
        }
    };



    return (
        <div className="content">
            <div className='standard-data-content'>
                <h2>기준 자료</h2>
                <Breadcrumb items={['기준자료']} />
                <div className="category-section">
                    <div className='category'>
                        <label htmlFor="category" className='category-label'>대분류 코드&gt;&gt;</label>
                        <select
                            id="category"
                            value={selectedCategory}
                            onChange={e => setSelectedCategory(e.target.value)}
                        >
                            {categories.map(category => (
                                <option key={category.categoryCode} value={category.categoryCode}>
                                    {category.categoryName}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className='main-content'>
                    <div className="sub-category-sidebar">
                        <div className="sub-category-header">
                            <label className='sub-category-label'>중분류 코드&gt;&gt;</label>
                            <button className="data-add-button">추 가</button>
                        </div>
                        <ul className="sub-category-list">
                            {subCategories.map(subCategory => (
                                <li
                                    key={subCategory.groupCd}
                                    onClick={() => setSelectedSubCategory(subCategory.groupCd)}
                                    className={selectedSubCategory === subCategory.groupCd ? 'active' : ''}
                                >
                                    {subCategory.groupNm}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="details-content">
                        <div className="detail-content-header">
                            <label className='detail-content-label'>상세 코드&gt;&gt;</label>
                            <button className="data-add-button">추 가</button>
                            <button className="data-delete-button">수 정</button>
                            <button className="data-delete-button">삭 제</button>
                        </div>
                        <div className="details-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>상세명</th>
                                        <th>항목1</th>
                                        <th>항목2</th>
                                        <th>항목3</th>
                                        <th>항목4</th>
                                        <th>항목5</th>
                                        <th>항목6</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {details.map(detail => (
                                        <tr key={detail.detailCd}>
                                            <td>{detail.detailNm}</td>
                                            <td>{detail.etcItem1}</td>
                                            <td>{detail.etcItem2}</td>
                                            <td>{detail.etcItem3}</td>
                                            <td>{detail.etcItem4}</td>
                                            <td>{detail.etcItem5}</td>
                                            <td>{detail.etcItem6}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StandardData;
