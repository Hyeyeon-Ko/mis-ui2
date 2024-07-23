import React, { useEffect, useState } from 'react';
import Breadcrumb from '../components/common/Breadcrumb';
import Table from '../components/common/Table';
import '../styles/StandardData.css';
import '../styles/common/Page.css';
import axios from 'axios';

/* 기준자료 페이지 */
function StandardData() {
    const [subCategories, setSubCategories] = useState([]);            // 중분류 코드 리스트 상태 관리
    const [details, setDetails] = useState([]);                        // 상세 데이터 리스트 상태 관리
    const [selectedCategory, setSelectedCategory] = useState('A');     // 선택된 대분류 코드 상태 관리, default 'A'
    const [selectedSubCategory, setSelectedSubCategory] = useState(''); // 선택된 중분류 코드 상태 관리
    const [subCategoryName, setSubCategoryName] = useState('');        // 선택된 중분류 코드의 이름 상태 관리

    const categories = [
        { categoryCode: 'A', categoryName: 'A 공통' },
        { categoryCode: 'B', categoryName: 'B 권한' },
    ];

    // 대분류코드 변경 시 중분류코드 업데이트
    useEffect(() => {
        fetchSubCategories(selectedCategory);
    }, [selectedCategory]);

    // 페이지 처음 로드 시 대분류 코드 A에 해당하는 중분류 코드들 불러오기
    useEffect(() => {
        fetchSubCategories('A');
    }, []);

    // 중분류 코드를 API로부터 불러오는 함수
    const fetchSubCategories = async (classCd) => {
        try {
            const response = await axios.get('/api/std/groupInfo', { params: { classCd } });
            const data = response.data.data || []; 
    
            setSubCategories(data);
    
            if (data.length > 0) {
                setSelectedSubCategory(data[0].groupCd); // 첫 번째 중분류 코드를 기본값으로 설정
                setSubCategoryName(`${data[0].groupCd} ${data[0].groupNm}`); // 첫 번째 중분류 코드의 이름을 설정
            } else {
                setSelectedSubCategory('');
                setSubCategoryName('');
            }
        } catch (error) {
            console.error('Error fetching sub-categories:', error.response ? error.response.data : error.message);
            setSubCategories([]);
            setSelectedSubCategory('');
            setSubCategoryName('');
        }
    };
    
    // 상세 데이터를 API로부터 불러오는 함수
    const fetchDetails = async (groupCd) => {
        try {
            const response = await axios.get(`/api/std/detailInfo`, { params: { groupCd } });
            const data = response.data.data || [];
            console.log('Fetched details:', data);
            setDetails(data.reverse()); 
        } catch (error) {
            console.error('Error fetching details:', error);
            setDetails([]);
        }
    };

    const handleAddRow = () => {
        const newRow = {
            detailNm: '', 
            etcItem1: '',
            etcItem2: '',
            etcItem3: '',
            etcItem4: '',
            etcItem5: '',
            etcItem6: '',
        };
        
        setDetails(prevDetails => [newRow, ...prevDetails]);
    };

    const handleAddSubCategoryRow = () => {
        const newRow = {
            groupCd: '새 항목',
            groupNm: '',  
        };

        setSubCategories(prevSubCategories => [...prevSubCategories, newRow]);
    };

    const handleSubCategoryClick = (groupCd, groupNm) => {
        setSelectedSubCategory(groupCd);
        setSubCategoryName(`${groupCd} ${groupNm}`);
        fetchDetails(groupCd); // 클릭 시 상세 데이터 불러오기
    };

    const mappedSubCategories = subCategories.map(subCategory => ({
        ...subCategory,
        onClick: handleSubCategoryClick,
        isSelected: subCategory.groupCd === selectedSubCategory,
    })).reverse();

    const subCategoryColumns = [
        { 
            header: '분류 코드', 
            accessor: 'groupNm', 
            width: '100%',
            Cell: ({ row }) => (
                <div 
                    className={`details-table ${row.isSelected ? 'selected' : ''}`} 
                    style={{ cursor: 'pointer' }} 
                    onClick={() => row.onClick(row.groupCd, row.groupNm)}
                >
                    {row.groupCd} {row.groupNm}
                </div>
            )
        },
    ];

    const detailColumns = [
        { header: '상세명', accessor: 'detailNm', width: '8%' },
        { header: '항목 1', accessor: 'etcItem1', width: '10%' },
        { header: '항목 2', accessor: 'etcItem2', width: '10%' },
        { header: '항목 3', accessor: 'etcItem3', width: '10%' },
        { header: '항목 4', accessor: 'etcItem4', width: '10%' },
        { header: '항목 5', accessor: 'etcItem5', width: '10%' },
        { header: '항목 6', accessor: 'etcItem6', width: '10%' },
    ];

    return (
        <div className="content">
            <div className='standard-data-content'>
                <h2>기준 자료</h2>
                <Breadcrumb items={['기준자료']} />
                <div className="category-section">
                    <div className="category">
                        <label htmlFor="category" className="category-label">대분류 코드&gt;&gt;</label>
                        <select
                            id="category"
                            value={selectedCategory}
                            onChange={e => setSelectedCategory(e.target.value)}
                            className="category-dropdown"
                        >
                            {categories.map(category => (
                                <option key={category.categoryCode} value={category.categoryCode}>
                                    {category.categoryName}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="tables-section">
                    <div className="sub-category-section">
                        <div className="header-buttons">
                            <label className='sub-category-label'>중분류 코드&gt;&gt;</label>
                            <button className="data-add-button" onClick={handleAddSubCategoryRow}>추 가</button>
                        </div>
                        <div className="sub-category-table">
                            <Table
                                columns={subCategoryColumns}
                                data={mappedSubCategories}
                            />
                        </div>
                    </div>
                    <div className="details-content">
                        <div className="header-buttons">
                            <label className='detail-content-label'>상세 코드&gt;&gt;</label>
                            <div className="detail-buttons">
                                <button className="data-add-button" onClick={handleAddRow}>추 가</button>
                                <button className="data-modify-button">수 정</button>
                                <button className="data-delete-button">삭 제</button>
                            </div>
                        </div>
                        <div className="details-table">
                            <Table
                                columns={detailColumns}
                                data={details} 
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StandardData;
