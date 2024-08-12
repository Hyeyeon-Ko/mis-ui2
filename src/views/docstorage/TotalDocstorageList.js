import React, { useState, useEffect } from 'react';
import Breadcrumb from '../../components/common/Breadcrumb';
import Table from '../../components/common/Table';
import DocstorageAddModal from './DocstorageAddModal'; // 모달 컴포넌트 가져오기
import '../../styles/common/Page.css';
import '../../styles/TotalDocstorageList.css';
import axios from 'axios';

function TotalDocstorageList() {
  const [centerData, setCenterData] = useState([]);
  const [selectedCenterCode, setSelectedCenterCode] = useState(null);
  const [docstorageDetails, setDocstorageDetails] = useState([]);
  const [centerDocstorageResponses, setCenterDocstorageResponses] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false); // 모달 열림 상태 관리

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/docstorageList/total');
        const { centerResponses, centerDocstorageResponses } = response.data.data;

        // 센터 데이터 한글 이름으로 정렬
        const sortedCenterData = [...centerResponses].sort((a, b) => {
          return a.detailNm.localeCompare(b.detailNm, 'ko-KR');
        });

        console.log("정렬된 센터 데이터:", sortedCenterData);
        console.log("센터 문서보관 데이터", centerDocstorageResponses);

        setCenterData([{ detailNm: '전국센터', detailCd: 'ALL' }, ...sortedCenterData]); // '전국센터' 추가
        setCenterDocstorageResponses(centerDocstorageResponses[0]); // 문서보관 데이터를 상태로 설정

        // 초기 선택된 센터 처리 (첫 번째 센터 선택)
        if (sortedCenterData.length > 0) {
          handleCenterClick('ALL'); // '전국센터' 선택
        }
      } catch (error) {
        console.error('데이터를 불러오는데 실패했습니다.', error);
      }
    };
    fetchData();
  }, []);

  const handleCenterClick = (detailCd) => {
    setSelectedCenterCode(detailCd);

    if (!centerDocstorageResponses) return;

    let selectedDetails = [];

    if (detailCd === 'ALL') {
      // 모든 센터의 데이터를 합쳐서 보여줌
      selectedDetails = [
        ...centerDocstorageResponses.foundationResponses,
        ...centerDocstorageResponses.gwanghwamunResponses,
        ...centerDocstorageResponses.yeouidoResponses,
        ...centerDocstorageResponses.gangnamResponses,
        ...centerDocstorageResponses.suwonResponses,
        ...centerDocstorageResponses.daeguResponses,
        ...centerDocstorageResponses.busanResponses,
        ...centerDocstorageResponses.gwangjuResponses,
        ...centerDocstorageResponses.jejuResponses,
      ];
    } else {
      const centerMapping = {
        "100": centerDocstorageResponses.foundationResponses,
        "101": centerDocstorageResponses.gwanghwamunResponses,
        "102": centerDocstorageResponses.yeouidoResponses,
        "103": centerDocstorageResponses.gangnamResponses,
        "104": centerDocstorageResponses.suwonResponses,
        "105": centerDocstorageResponses.daeguResponses,
        "106": centerDocstorageResponses.busanResponses,
        "107": centerDocstorageResponses.gwangjuResponses,
        "108": centerDocstorageResponses.jejuResponses,
      };

      selectedDetails = centerMapping[detailCd] || [];
    }

    // NO 값을 1부터 순차적으로 매깁니다.
    const numberedDetails = selectedDetails.map((item, index) => ({
      ...item,
      no: index + 1,
    }));

    console.log(`선택된 센터 코드: ${detailCd}`);
    console.log("선택된 센터의 문서보관 내역:", numberedDetails);

    setDocstorageDetails(numberedDetails);
  };

  const handleSave = (newData) => {
    // 새 데이터를 추가한 후 테이블을 업데이트하거나 추가 로직을 처리합니다.
    console.log("새로 추가된 데이터:", newData);
    setShowAddModal(false); // 모달 닫기
  };

  const subCategoryColumns = [
    {
      header: '센터명',
      accessor: 'detailNm',
      width: '100%',
      Cell: ({ row }) => {
        const { detailCd } = row;
        return (
          <div
            className="totalDocstorage-details-table"
            style={{ cursor: 'pointer' }}
            onClick={() => handleCenterClick(detailCd)}
          >
            <span>{row.detailNm}</span>
          </div>
        );
      }
    },
  ];

  const detailColumns = [
    {
      header: (
        <input
          type="checkbox"
        />
      ),
      accessor: 'select',
      width: '5%',
      Cell: () => (
        <input
          type="checkbox"
          name="detailSelect"
        />
      ),
    },
    { header: 'NO', accessor: 'no' },
    { header: '팀명', accessor: 'teamNm' },
    { header: '문서관리번호', accessor: 'docId' },
    { header: '입고위치', accessor: 'location' },
    { header: '문서명', accessor: 'docNm' },
    { header: '관리자(정)', accessor: 'manager' },
    { header: '관리자(부)', accessor: 'subManager' },
    { header: '보존연한', accessor: 'storageYear' },
    { header: '생성일자', accessor: 'createDate' },
    { header: '이관일자', accessor: 'transferDate' },
    { header: '기안번호', accessor: 'tsdNum' },
    { header: '폐기일자', accessor: 'disposalDate' },
    { header: '기안번호', accessor: 'dpdraftNum' },
  ];

  return (
    <div className='content'>
      <div className="totalDocstorage-content">
        <div className='totalDocstorage-content-inner'>
            <h2>전국 문서보관 목록표</h2>
            <Breadcrumb items={['자산 및 문서 관리', '전국 문서보관 목록표']} />
            <div className="totalDocstorage-tables-section">
            <div className="totalDocstorage-sub-category-section">
                <div className="totalDocstorage-header-buttons">
                <label className='totalDocstorage-sub-category-label'>센 터&gt;&gt;</label>
                </div>
                <div className="totalDocstorage-sub-category-table">
                <Table
                    columns={subCategoryColumns}
                    data={centerData}
                />
                </div>
            </div>
            <div className="totalDocstorage-details-content">
                <div className="totalDocstorage-header-buttons">
                <label className='totalDocstorage-detail-content-label'>문서보관 내역&gt;&gt;</label>
                <div className="totalDocstorage-detail-buttons">
                    <button className="totalDocstorage-add-button" onClick={() => setShowAddModal(true)}>추 가</button>
                    <button className="totalDocstorage-modify-button">수 정</button>
                    <button className="totalDocstorage-delete-button">삭 제</button>
                    <button className="totalDocstorage-excel-button">엑 셀</button>
                </div>
                </div>
                <div className="totalDocstorage-details-table">
                    <Table
                    columns={detailColumns}
                    data={docstorageDetails}
                    />
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* 모달 컴포넌트 */}
      <DocstorageAddModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleSave}
      />
    </div>
  );
}

export default TotalDocstorageList;
