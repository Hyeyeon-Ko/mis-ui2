import React, { useContext, useState, useEffect, useCallback } from "react";
import Breadcrumb from "../../components/common/Breadcrumb";
import Button from "../../components/common/Button";
import CustomButton from "../../components/common/CustomButton";
import ConditionFilter from "../../components/common/ConditionFilter";
import CorpDocApprovalModal from "../../views/corpdoc/CorpDocApprovalModal";
import CorpDocStoreModal from "./CorpDocStoreModal";
import IssueModal from "../../components/common/ConfirmModal";
import CustomSelect from "../../components/CustomSelect";
import SignitureImage from "../../assets/images/signiture.png";
import axios from "axios";
import { AuthContext } from "../../components/AuthContext";
import "../../styles/corpdoc/CorpDocIssueList.css";
import { corpFilterData } from "../../datas/corpDocDatas";
import useDateSet from "../../hooks/apply/useDateSet";
import Pagination from "../../components/common/Pagination";

function CorpDocIssueList() {
  const { refreshSidebar } = useContext(AuthContext);
  const [applications, setApplications] = useState([]);
  const [pendingApplications, setPendingApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [filteredPendingApplications, setFilteredPendingApplications] =
    useState([]);
  const [filterInputs, setFilterInputs] = useState(corpFilterData);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDocumentDetails, setSelectedDocumentDetails] = useState(null);
  const [clickedRows, setClickedRows] = useState([]);
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedPendingApp, setSelectedPendingApp] = useState(null);
  const [totalCorpseal, setTotalCorpseal] = useState(0);
  const [totalCoregister, setTotalCoregister] = useState(0);

  const [selectedCenter, setSelectedCenter] = useState("전체");

  const [centers] = useState([
    "전체",
    "재단본부",
    "광화문",
    "여의도센터",
    "강남센터",
    "수원센터",
    "대구센터",
    "부산센터",
    "광주센터",
    "제주센터",
    "협력사",
  ]);

  const { defaultStartDate, defaultEndDate } = useDateSet();
  const [totalPages, setTotalPages] = useState("1");
  const [currentPage, setCurrentPage] = useState("1");
  const [totalPendingPages, setTotalPendingPages] = useState("1");
  const [currentPendingPage, setCurrentPendingPage] = useState(1);

  const itemsPerPage = 10;

  const handlePageClick = (event) => {
    const selectedPage = event.selected + 1;
    setCurrentPage(selectedPage);
  };

  const handlePendingPageClick = (event) => {
    const selectedPendingPage = event.selected + 1;
    setCurrentPendingPage(selectedPendingPage);
  };

  const issueSearch = (filterValues) => {
    // filterValues에서 documentType과 기타 필터 값을 가져옴
    const { startDate, endDate, searchType, keyword } = filterValues;

    const params = {
      startDate: startDate ? startDate.toISOString().split("T")[0] : "", // 시작일
      endDate: endDate ? endDate.toISOString().split("T")[0] : "", // 종료일
      searchType: searchType,
      keyword: keyword, // 검색어
    };

    fetchIssueData(1, itemsPerPage, params);
  };

  // const fetchIssueData = useCallback(async (searchType = '전체', keyword = '', startDate = null, endDate = null, pageIndex = 1, pageSize = itemsPerPage) => {
  const fetchIssueData = useCallback(
    async (pageIndex = 1, pageSize = itemsPerPage, filters = {}) => {
      try {
        const response = await axios.get(`/api/corpDoc/issueList`, {
          params: {
            // PostSearchRequestDTO parameters
            // searchType,
            // keyword,
            // startDate: defaultStartDate,
            // endDate: defaultEndDate,

            searchType: filters.searchType,
            keyword: filters.keyword,
            startDate: filters.startDate ? filters.startDate : defaultStartDate,
            endDate: filters.endDate ? filters.endDate : defaultEndDate,

            // PostPageRequest parameters
            pageIndex,
            pageSize,
          },
        });

        if (response.data) {
          const data = response.data.data;

          const totalPages = data.totalPages || 1;
          const currentPage = data.number + 1;

          const issueListContent = Array.isArray(data.content)
            ? data.content
            : [];
          const issueListData = issueListContent.map((item) => ({
            id: item.draftId,
            date: item.draftDate,
            issueDate: item.issueDate.split("T")[0],
            submission: item.submission || "",
            purpose: item.purpose || "",
            corpSeal: {
              incoming: item.status === "X" ? item.certCorpseal : 0,
              used: item.status === "X" ? 0 : item.certCorpseal,
              left: item.totalCorpseal,
            },
            registry: {
              incoming: item.status === "X" ? item.certCoregister : 0,
              used: item.status === "X" ? 0 : item.certCoregister,
              left: item.totalCoregister,
            },
            note: item.note,
            applicantName: item.drafter || "",
            center: item.instNm || "",
            approveStatus: "결재진행중",
            status: item.status,
            approvers: [],
            signitureImage: SignitureImage,
          }));

          setApplications(issueListData);

          const totalValues = extractTotalValues(issueListData);
          setTotalCorpseal(totalValues.totalCorpseal);
          setTotalCoregister(totalValues.totalCoregister);

          setInitialDataLoaded(true);

          setTotalPages(totalPages);
          setCurrentPage(currentPage);
        }
      } catch (error) {
        console.error("Error fetching issue data:", error);
      }
    },
    [defaultStartDate, defaultEndDate]
  );

  const fetchIssuePendingData = useCallback(
    async (pageIndex = 1, pageSize = itemsPerPage) => {
      try {
        const response = await axios.get(`/api/corpDoc/issuePendingList`, {
          params: {
            // PostPageRequest parameters
            pageIndex,
            pageSize,
          },
        });

        if (response.data) {
          const data = response.data.data;
          const totalPendingPages = data.totalPages || 1;
          const currentPendingPage = data.number + 1;

          const issuePendingListContent = Array.isArray(data.content)
            ? data.content
            : [];
          const issuePendingListData = issuePendingListContent.map((item) => ({
            id: item.draftId,
            useDate: item.useDate,
            submission: item.submission || "",
            purpose: item.purpose || "",
            corpSeal: {
              incoming: 0,
              used: item.certCorpseal,
              left: item.totalCorpseal,
            },
            registry: {
              incoming: 0,
              used: item.certCoregister,
              left: item.totalCoregister,
            },
            usesignet: { used: item.certUsesignet },
            warrant: { used: item.warrant },
            status: item.status,
            applicantName: item.drafter || "",
            center: item.instNm || "",
            approvers: [],
            signitureImage: SignitureImage,
          }));

          setPendingApplications(issuePendingListData);

          setInitialDataLoaded(true);

          setTotalPendingPages(totalPendingPages);
          setCurrentPendingPage(currentPendingPage);
        }
      } catch (error) {
        console.error("Error fetching issue pending data:", error);
      }
    },
    [setCurrentPendingPage]
  );

  useEffect(() => {
    fetchIssueData(currentPage, itemsPerPage);
  }, [currentPage, fetchIssueData]);

  useEffect(() => {
    fetchIssuePendingData(currentPendingPage, itemsPerPage);
  }, [currentPendingPage, fetchIssuePendingData]);

  useEffect(() => {
    if (!initialDataLoaded) {
      fetchIssueData();
      fetchIssuePendingData();
    }
  }, [fetchIssueData, fetchIssuePendingData, initialDataLoaded]);

  useEffect(() => {
    const filteredApps = applications.filter(
      (app) => selectedCenter === "전체" || app.center === selectedCenter
    );
    const filteredPendingApps = pendingApplications.filter(
      (app) => selectedCenter === "전체" || app.center === selectedCenter
    );

    setFilteredApplications(filteredApps);
    setFilteredPendingApplications(filteredPendingApps);
  }, [selectedCenter, applications, pendingApplications]);

  const resetFilters = useCallback(() => {
    const defaultStartDate = new Date();
    defaultStartDate.setMonth(defaultStartDate.getMonth() - 1);
    setFilterInputs({
      startDate: defaultStartDate,
      endDate: new Date(),
      searchType: "전체",
      keyword: "",
    });
  }, []);

  useEffect(() => {
    resetFilters();
  }, [resetFilters]);

  const handleReset = () => {
    resetFilters();
    fetchIssueData();
    fetchIssuePendingData();
  };

  const extractTotalValues = (data) => {
    if (!data || !Array.isArray(data)) {
      return { totalCorpseal: 0, totalCoregister: 0 };
    }

    const lastRow = data[data.length - 1];
    const totalCorpseal = lastRow?.corpSeal?.left ?? 0;
    const totalCoregister = lastRow?.registry?.left ?? 0;

    return { totalCorpseal, totalCoregister };
  };

  const handleRowClick = (status, document) => {
    if (status === "결재진행중" || status === "결재완료") {
      if (status === "결재완료") {
        setClickedRows((prevClickedRows) => {
          const newClickedRows = [...prevClickedRows, document.id];
          localStorage.setItem("clickedRows", JSON.stringify(newClickedRows));
          return newClickedRows;
        });
      }
      setSelectedDocumentDetails({
        ...document,
        signitureImage: document.signitureImage || SignitureImage,
      });
      setModalVisible(true);
    }
  };

  const handleIssue = (app) => {
    setSelectedPendingApp(app);
    setShowIssueModal(true);
  };

  const handleconfirmIssue = async () => {
    if (applications.length === 0) {
      alert("입고된 서류가 없습니다. 먼저 서류 입고를 해주세요.");
      setShowIssueModal(false);
      return;
    }

    const { totalCorpseal, totalCoregister } = extractTotalValues(applications);

    if (totalCorpseal === 0 || totalCoregister === 0) {
      alert("입고된 서류가 없습니다. 서류 입고를 해주세요.");
      return;
    }

    try {
      const response = await axios.put(
        `/api/corpDoc/issue?draftId=${selectedPendingApp.id}`,
        {
          totalCorpseal,
          totalCoregister,
        }
      );

      if (response.status === 200) {
        fetchIssueData();
        fetchIssuePendingData();
        setShowIssueModal(false);

        refreshSidebar();
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        alert("서류를 발급할 수 없습니다. 잔고를 확인해주세요.");
      } else {
        alert("서류 발급 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
      setShowIssueModal(false);
    }
  };

  const handleCenterChange = (e) => {
    setSelectedCenter(e.target.value);
  };

  return (
    <div className="content">
      <div className="corpDoc-issue-list">
        <h2>서류 발급 대장</h2>
        <div className="corpDoc-header-row">
          <Breadcrumb items={["법인서류 대장", "서류 발급 대장"]} />
          <CustomButton
            className="store-button"
            onClick={() => setShowStoreModal(true)}
          >
            입고 등록하기
          </CustomButton>
        </div>

        <ConditionFilter
          startDate={filterInputs.startDate}
          setStartDate={(startDate) =>
            setFilterInputs((prev) => ({ ...prev, startDate }))
          }
          endDate={filterInputs.endDate}
          setEndDate={(endDate) =>
            setFilterInputs((prev) => ({ ...prev, endDate }))
          }
          filters={{}}
          setFilters={() => {}}
          onSearch={issueSearch}
          onReset={handleReset}
          showStatusFilters={false}
          showSearchCondition={true}
          showDocumentType={false}
          searchType={filterInputs.searchType}
          setSearchType={(searchType) =>
            setFilterInputs((prev) => ({ ...prev, searchType }))
          }
          keyword={filterInputs.keyword}
          setKeyword={(keyword) =>
            setFilterInputs((prev) => ({ ...prev, keyword }))
          }
          searchOptions={["전체", "이름", "제출처", "사용목적"]}
          startDateLabel="발급/입고일자"
          setDocumentType={() => {}}
        />

        <table className="corpDoc-issue-table">
          <thead>
            <tr>
              <th rowSpan="2">No.</th>
              <th rowSpan="2">발급/입고일자</th>
              <th colSpan="2">신청자</th>
              <th rowSpan="2">제출처</th>
              <th rowSpan="2">사용목적</th>
              <th colSpan="3">법인인감증명서</th>
              <th colSpan="3">법인등기사항전부증명서</th>
              <th rowSpan="2">비고</th>
              <th rowSpan="2">결재</th>
            </tr>
            <tr>
              <th>
                <CustomSelect
                  label="센터"
                  options={centers}
                  selectedValue={selectedCenter}
                  onChangeHandler={handleCenterChange}
                />
              </th>
              <th>이름</th>
              <th>입고</th>
              <th>사용</th>
              <th>잔고</th>
              <th>입고</th>
              <th>사용</th>
              <th>잔고</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.length > 0 ? (
              filteredApplications.map((app, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{app.issueDate}</td>
                  <td>{app.center}</td>
                  <td>{app.status === "X" ? "" : app.applicantName}</td>
                  <td>{app.submission}</td>
                  <td>{app.purpose}</td>
                  <td>{app.corpSeal.incoming}</td>
                  <td>{app.corpSeal.used}</td>
                  <td>{app.corpSeal.left}</td>
                  <td>{app.registry.incoming}</td>
                  <td>{app.registry.used}</td>
                  <td>{app.registry.left}</td>
                  <td>{app.note === "P" ? "PDF" : ""}</td>
                  <td
                    className={`status-${app.approveStatus
                      .replace(/\s+/g, "-")
                      .toLowerCase()} clickable ${
                      clickedRows.includes(app.id) ? "confirmed" : ""
                    }`}
                    onClick={() => handleRowClick(app.approveStatus, app)}
                  >
                    {app.approveStatus}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="13" style={{ textAlign: "center" }}>
                  조회된 데이터가 없습니다
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <Pagination
          type="issueList"
          totalPages={totalPages}
          onPageChange={handlePageClick}
        />
        <div className="corpDoc-issue-pending-list">
          <h3>발급 대기 목록</h3>
          <table className="table">
            <thead>
              <tr>
                <th rowSpan="2">No.</th>
                <th rowSpan="2">사용일자</th>
                <th colSpan="2">신청자</th>
                <th rowSpan="2">제출처</th>
                <th rowSpan="2">사용목적</th>
                <th colSpan="4">필요 수량</th>
                <th rowSpan="2">발급</th>
              </tr>
              <tr>
                <th>센터</th>
                <th>이름</th>
                <th>법인인감증명서</th>
                <th>법인등기사항전부증명서</th>
                <th>사용인감계</th>
                <th>위임장</th>
              </tr>
            </thead>
            <tbody>
              {filteredPendingApplications.length > 0 ? (
                filteredPendingApplications.map((app, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{app.useDate}</td>
                    <td>{app.center}</td>
                    <td>{app.applicantName}</td>
                    <td>{app.submission}</td>
                    <td>{app.purpose}</td>
                    <td>{app.corpSeal.used}</td>
                    <td>{app.registry.used}</td>
                    <td>{app.usesignet.used}</td>
                    <td>{app.warrant.used}</td>
                    <td>
                      <Button
                        className="confirm-issue-button"
                        onClick={() => handleIssue(app)}
                      >
                        발 급
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" style={{ textAlign: "center" }}>
                    조회된 데이터가 없습니다
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <Pagination
            type="issuePendingList"
            totalPages={totalPendingPages}
            currentPage={currentPendingPage}
            onPageChange={handlePendingPageClick}
          />
        </div>
      </div>
      {modalVisible && selectedDocumentDetails && (
        <CorpDocApprovalModal
          show={modalVisible}
          onClose={() => setModalVisible(false)}
          documentDetails={selectedDocumentDetails}
        />
      )}
      {showIssueModal && selectedPendingApp && (
        <IssueModal
          show={showIssueModal}
          onClose={() => setShowIssueModal(false)}
          onCancel={() => setShowIssueModal(false)}
          onConfirm={handleconfirmIssue}
          message={`법인서류를 발급하시겠습니까?`}
        />
      )}
      <CorpDocStoreModal
        show={showStoreModal}
        onClose={() => setShowStoreModal(false)}
        totalCorpseal={totalCorpseal}
        totalCoregister={totalCoregister}
        onSave={fetchIssueData}
      />
    </div>
  );
}

export default CorpDocIssueList;
