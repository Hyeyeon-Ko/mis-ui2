import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Breadcrumb from '../../components/common/Breadcrumb';
import Table from '../../components/common/Table';
import '../../styles/common/Page.css';
import '../../styles/rental/TotalRentalManage.css';

function TotalRentalManage() {
  const [selectedCenter, setSelectedCenter] = useState('all'); 
  const [centerData, setCenterData] = useState([]);
  const [rentalDetails, setRentalDetails] = useState([]);
  const [centerRentalResponses, setCenterRentalResponses] = useState(null);
  const [detailColumns, setDetailColumns] = useState([]);

  useEffect(() => {
    const fetchRentalData = async () => {
      try {
        const response = await axios.get('/api/rentalList/total');
        const { centerResponses, centerRentalResponses } = response.data.data;
        console.log('data: ', centerRentalResponses);

        const nationwideCenter = { detailNm: '전국센터', detailCd: 'all' };
        const sortedCenterData = [nationwideCenter, ...centerResponses.sort((a, b) => 
          a.detailNm.localeCompare(b.detailNm, 'ko-KR')
        )];

        setCenterData(sortedCenterData);
        setCenterRentalResponses(centerRentalResponses[0]);

        handleCenterClick('all');
      } catch (error) {
        console.error("렌탈 데이터를 불러오는 중 오류 발생:", error);
      }
    };

    fetchRentalData();
  }, []);

  const getDefaultColumns = () => [
    { header: 'NO', accessor: 'no' },
    { header: '제품군', accessor: 'category' },
    { header: '업체명', accessor: 'companyNm' },
    { header: '계약번호', accessor: 'contractNum' },
    { header: '모델명', accessor: 'modelNm' },
    { header: '설치일자', accessor: 'installDate' },
    { header: '만료일자', accessor: 'expiryDate' },
    { header: '렌탈료', accessor: 'rentalFee' },
    { header: '위치분류', accessor: 'location' },
    { header: '설치위치', accessor: 'installationSite' },
    { header: '특이사항', accessor: 'specialNote' },
  ];

  const getNationwideColumns = () => [
    { header: '센터명', accessor: 'center' },
    { header: '정수기', accessor: 'waterPurifier' },
    { header: '공기청정기', accessor: 'airPurifier' },
    { header: '비데', accessor: 'bidet' },
    { header: '월 렌탈금액', accessor: 'monthlyRentalFee' },
  ];

  const handleCenterClick = (detailCd) => {
    setSelectedCenter(detailCd);

    if (detailCd === 'all') {
      setRentalDetails([]);
      setDetailColumns(getNationwideColumns());
      return;
    }

    if (!centerRentalResponses) return;

    const centerMapping = {
      "100": centerRentalResponses.foundationResponses,
      "111": centerRentalResponses.gwanghwamunResponses,
      "112": centerRentalResponses.yeouidoResponses,
      "113": centerRentalResponses.gangnamResponses,
      "211": centerRentalResponses.suwonResponses,
      "611": centerRentalResponses.daeguResponses,
      "612": centerRentalResponses.busanResponses,
      "711": centerRentalResponses.gwangjuResponses,
      "811": centerRentalResponses.jejuResponses,
    };

    const selectedDetails = centerMapping[detailCd] || [];

    const numberedDetails = selectedDetails.map((item, index) => ({
      ...item,
      no: index + 1,
      detailId: item.detailId || `id-${index}`,
    }));

    setRentalDetails(numberedDetails);
    setDetailColumns(getDefaultColumns());
  };

  const handleExcelDownload = async () => {
    if (selectedCenter === 'all') {
      try {
        const response = await axios.get('/api/rental/totalExcel', {
          responseType: 'blob',
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', '전국센터 렌탈현황 관리표.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (error) {
        console.error("엑셀 다운로드 실패:", error);
      }
      return;
    }

    if (!selectedCenter) {
      alert("엑셀 파일로 내보낼 항목을 선택하세요.");
      return;
    }

    try {
      const response = await axios.post('/api/rental/excel', rentalDetails, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', '렌탈현황 관리표.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("엑셀 다운로드 실패:", error);
    }
  };

  const subCategoryColumns = [
    {
      header: '센터명',
      accessor: 'detailNm',
      width: '100%',
      Cell: ({ row }) => {
        const { detailCd } = row;
        const isSelected = detailCd === selectedCenter;
        return (
          <div
            className="totalRentalManage-details-table"
            style={{ cursor: 'pointer' }}
            onClick={() => handleCenterClick(detailCd)}
          >
            <span className={isSelected ? 'selected-sub-category-text' : ''}>
              {row.detailNm}
            </span>
          </div>
        );
      }
    },
  ];

  return (
    <div className='content'>
      <div className="totalRentalManage-content">
        <div className='totalRentalManage-content-inner'>
          <h2>전국 렌탈현황 관리표</h2>
          <Breadcrumb items={['자산 및 대여 관리', '전국 렌탈현황 관리표']} />
          <div className="totalRentalManage-tables-section">
            <div className="totalRentalManage-sub-category-section">
              <div className="totalRentalManage-header-buttons">
                <label className='totalRentalManage-sub-category-label'>센 터&gt;&gt;</label>
              </div>
              <div className="totalRentalManage-sub-category-table">
                <Table
                  columns={subCategoryColumns}
                  data={centerData}
                />
              </div>
            </div>
            <div className="totalRentalManage-details-content">
              <div className="totalRentalManage-header-buttons">
                <label className='totalRentalManage-detail-content-label'>렌탈 현황&gt;&gt;</label>
                <div className="totalRentalManage-detail-buttons">
                  <button
                    className="totalRentalManage-excel-button"
                    onClick={handleExcelDownload}
                  >
                    엑 셀
                  </button>
                </div>
              </div>
              <div className="totalRentalManage-details-table">
                <Table
                  columns={detailColumns}
                  data={rentalDetails}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TotalRentalManage;
