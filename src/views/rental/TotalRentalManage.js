import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Breadcrumb from '../../components/common/Breadcrumb';
import Table from '../../components/common/Table';
import '../../styles/common/Page.css';
import '../../styles/rental/TotalRentalManage.css';
import Loading from '../../components/common/Loading';

function TotalRentalManage() {
    const [selectedCenter, setSelectedCenter] = useState('all'); 
    const [centerData, setCenterData] = useState([]);
    const [rentalDetails, setRentalDetails] = useState([]);
    const [centerRentalResponses, setCenterRentalResponses] = useState(null);
    const [nationwideSummary, setNationwideSummary] = useState([]); 
    const [selectedRows, setSelectedRows] = useState([]); 
    const [loading, setLoading] = useState(false)
    const [lastUpdated, setLastUpdated] = useState('');

    const dragStartIndex = useRef(null);
    const dragEndIndex = useRef(null);
    const dragMode = useRef('select'); 

    useEffect(() => {
      const fetchRentalData = async () => {
        setLoading(true)
          try {
              const response = await axios.get(`/api/rentalList/total`);
              const { centerResponses, centerRentalResponses, summaryResponses } = response.data.data;
  
              const nationwideCenter = { detailNm: '전국센터', detailCd: 'all' };
              const sortedCenterData = [
                  nationwideCenter, 
                  ...centerResponses  
              ];

              const formattedSummaryResponses = summaryResponses.map(summary => ({
                  ...summary,
                  monthlyRentalFee: summary.monthlyRentalFee.toLocaleString() 
              }));
  
              setNationwideSummary(formattedSummaryResponses); 
              setRentalDetails(formattedSummaryResponses);
  
              setCenterData(sortedCenterData);
              setCenterRentalResponses(centerRentalResponses[0]);

              if (centerRentalResponses[0]?.foundationResponses?.length > 0) {
                setLastUpdated(centerRentalResponses[0].foundationResponses[0].lastUpdtDate);
            }
  
          } catch (error) {
              console.error("렌탈 데이터를 불러오는 중 오류 발생:", error);
          } finally {
            setLoading(false)

          }
      };
  
      fetchRentalData();
  }, []);

  const getDefaultColumns = () => [
      {
          header: (
              <input
                  type="checkbox"
                  onChange={(e) => {
                      const isChecked = e.target.checked;
                      setSelectedRows(isChecked ? rentalDetails.map(d => d.detailId) : []);
                  }}
                  disabled={selectedCenter === 'all'} 
              />
          ),
          accessor: 'select',
          width: '5%',
          Cell: ({ row }) => {
              const detailId = row?.detailId || row?.original?.detailId; 
              return (
                  <input
                      type="checkbox"
                      name="detailSelect"
                      onClick={(e) => e.stopPropagation()} 
                      onChange={() => handleRowClick(row)}
                      checked={detailId && selectedRows.includes(detailId)}
                      disabled={selectedCenter === 'all'} 
                  />
              );
          },
      },
      { header: 'NO', accessor: 'no' },
      { header: '업체명', accessor: 'companyNm' },
      { header: '제품군', accessor: 'category' },
      { header: '계약번호', accessor: 'contractNum' },
      { header: '모델명', accessor: 'modelNm' },
      { header: '설치일자', accessor: 'installDate' },
      { header: '만료일자', accessor: 'expiryDate' },
      { header: '렌탈료', accessor: 'rentalFee' },
      { header: '위치분류', accessor: 'location' },
      { header: '설치장소', accessor: 'installationSite' },
      { header: '특이사항', accessor: 'specialNote' },
    ];
  
    const getNationwideColumns = () => [
        { header: '센터명', accessor: 'center' },
        { header: '정수기', accessor: 'waterPurifier' },
        { header: '공기청정기', accessor: 'airPurifier' },
        { header: '비데', accessor: 'bidet' },
        { header: '렌탈금액', accessor: 'monthlyRentalFee' },
    ];

    const handleCenterChange = (e) => {
        const detailCd = e.target.value;
        setSelectedCenter(detailCd);
        setSelectedRows([]);

        if (detailCd === 'all') {
            setRentalDetails(nationwideSummary); 
            setLastUpdated('');
            return;
        }

        if (!centerRentalResponses) return;

        const centerMapping = {
          "100": centerRentalResponses.foundationResponses,
          "111": centerRentalResponses.bonwonResponses,
          "112": centerRentalResponses.yeouidoResponses,
          "113": centerRentalResponses.gangnamResponses,
          "119": centerRentalResponses.gwanghwamunResponses,
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

        if (selectedDetails.length > 0) {
            setLastUpdated(selectedDetails[0].lastUpdtDate);  
        } else {
            setLastUpdated('');
        }
    };

    const handleRowClick = (row) => {
      const detailId = row.detailId;
      if (selectedRows.includes(detailId)) {
        setSelectedRows(prevSelectedRows => prevSelectedRows.filter(id => id !== detailId));
      } else {
        setSelectedRows(prevSelectedRows => [...prevSelectedRows, detailId]);
      }
    };
  
    const handleMouseDown = (index) => {
      dragStartIndex.current = index;
  
      const detailId = rentalDetails[index].detailId;
      if (selectedRows.includes(detailId)) {
        dragMode.current = 'deselect'; 
      } else {
        dragMode.current = 'select'; 
      }
    };
  
    const handleMouseOver = (index) => {
      if (dragStartIndex.current !== null) {
        dragEndIndex.current = index;
        const start = Math.min(dragStartIndex.current, dragEndIndex.current);
        const end = Math.max(dragStartIndex.current, dragEndIndex.current);
  
        let newSelectedRows = [...selectedRows];
  
        for (let i = start; i <= end; i++) {
          const detailId = rentalDetails[i].detailId;
          if (dragMode.current === 'select' && !newSelectedRows.includes(detailId)) {
            newSelectedRows.push(detailId); 
          } else if (dragMode.current === 'deselect' && newSelectedRows.includes(detailId)) {
            newSelectedRows = newSelectedRows.filter(id => id !== detailId); 
          }
        }
  
        setSelectedRows(newSelectedRows);
      }
    };
  
    const handleMouseUp = () => {
      dragStartIndex.current = null;
      dragEndIndex.current = null;
    };
  
    const handleExcelDownload = async () => {
      try {
        let response;
        if (selectedCenter === 'all') {
          response = await axios.get(`/api/rental/totalExcel`, {
            responseType: 'blob',
          });
        } else {
          const detailIds = selectedRows;
          
          response = await axios.post(`/api/rental/excel`, detailIds, {
            responseType: 'blob',
          });
        }
    
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', '렌탈 관리표.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (error) {
        console.error("엑셀 다운로드 실패:", error);
      }
    };

    return (
        <div className='content'>
            <div className="totalRentalManage-content">
                <div className='totalRentalManage-content-inner'>
                    <h2>전국 렌탈 관리표</h2>
                    <Breadcrumb items={['자산 관리', '전국 렌탈 관리표']} />
                    <div className="totalRentalManage-category-section">
                        <div className="totalRentalManage-category">
                            <label htmlFor="center" className="totalRentalManage-category-label">센 터&gt;&gt;</label>
                            <select
                                id="center"
                                className="totalRentalManage-category-dropdown"
                                value={selectedCenter}
                                onChange={handleCenterChange}
                            >
                                {centerData.map(center => (
                                    <option key={center.detailCd} value={center.detailCd}>
                                        {center.detailNm}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    {loading ? (
                      <Loading />
                    ) : (
                      <>
                    <div className="totalRentalManage-details-content">
                        <div className="totalRentalManage-header-buttons">
                            <label className='totalRentalManage-detail-content-label'>렌탈 현황&gt;&gt;</label>
                            <div className="totalRentalManage-detail-buttons">
                                {selectedCenter !== 'all' && lastUpdated && (
                                    <div className="last-updated">
                                        최종 수정일시: {lastUpdated}
                                    </div>
                                )}
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
                                columns={selectedCenter === 'all' ? getNationwideColumns() : getDefaultColumns()}
                                data={rentalDetails}
                                onRowClick={handleRowClick}
                                onRowMouseDown={handleMouseDown}
                                onRowMouseOver={handleMouseOver}
                                onRowMouseUp={handleMouseUp}
                            />
                        </div>
                    </div>
                    </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TotalRentalManage;
