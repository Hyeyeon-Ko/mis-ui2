import React, { useCallback, useContext, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import * as XLSX from "xlsx";
import { AuthContext } from "../../components/AuthContext";
import useTonerChange from "../../hooks/useTonerChange";
import "../../styles/toner/TonerAddModal.css";
import { addTonerFormData, tonerFormFields } from "../../datas/tonerData";

const TonerInfoModal = ({ show, onClose, onSave, editMode, selectedData }) => {
  const { auth } = useContext(AuthContext);
  const {
    handleChange,
    handleTabChange,
    handleFileChange,
    formData,
    file,
    activeTab,
    setFormData,
    setActiveTab,
    setFile,
  } = useTonerChange();

  const resetFormData = useCallback(() => {
    setFormData({ ...addTonerFormData });
    setFile(null);
    setActiveTab("text");
  }, [setFormData, setFile, setActiveTab]);

  const resetFormDataRef = useRef(resetFormData);
  useEffect(() => {
    resetFormDataRef.current = resetFormData;
  }, [resetFormData]);

  const setFormDataRef = useRef(setFormData);
  useEffect(() => {
    setFormDataRef.current = setFormData;
  }, [setFormData]);

  useEffect(() => {
    if (editMode && selectedData) {

      setFormDataRef.current((prevData) => {
        const newData = {
          mngNum: selectedData.mngNum || "",
          floor: selectedData.floor || "",
          teamNm: selectedData.teamNm || "",
          manager: selectedData.manager || "",
          subManager: selectedData.subManager || "",
          location: selectedData.location || "",
          productNm: selectedData.productNm || "",
          modelNm: selectedData.modelNm || "",
          sn: selectedData.sn || "",
          company: selectedData.company || "",
          manuDate: selectedData.manuDate || "",
          tonerNm: selectedData.tonerNm || "",
          price: selectedData.price || "",
        };

        if (JSON.stringify(prevData) !== JSON.stringify(newData)) {
          return newData;
        }
        return prevData;
      });
    } else {
      resetFormDataRef.current();
    }
  }, [editMode, selectedData]);

  const sendTonerExcel = async (data) => {
    try {
      const requestData = {
        details: data,
        instCd: auth.instCd,
        userId: auth.userId,
      };

      //TODO: api 개발 후 변경
      const response = await axios.post("/api/toner/excel", requestData);
      alert("항목이 성공적으로 추가되었습니다");
      onSave(response.data);
      onClose();
    } catch (error) {
      console.error("Error sending data to the backend:", error);
      alert("엑셀 데이터를 전송하는 중 오류가 발생했습니다.");
    }
  };

  const handleSaveClick = () => {
    if (activeTab === "file") {
      if (!file) {
        alert("파일을 첨부해주세요.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        const worksheetData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: "",
          raw: false,
          dateNF: "yyyy-mm-dd",
        });

        const extractedData = worksheetData
          .slice(2)
          .filter((row) => row[0] === "구입" || row[0] === "구매")
          .map((row) => ({
            mngNum: row[1],
            floor: row[2],
            teamNm: row[3],
            manager: row[4],
            subManager: row[5],
            location: row[6],
            productNm: row[7],
            modelNm: row[8],
            sn: row[9],
            company: row[10],
            manuDate: row[11],
            tonerNm: row[14],
            price: row[16],
          }));

        sendTonerExcel(extractedData);
      };
      reader.readAsArrayBuffer(file);
    } else {
      const {
        mngNum,
        floor,
        teamNm,
        manager,
        subManager,
        location,
        productNm,
        modelNm,
        sn,
        company,
        manuDate,
        tonerNm,
        price,
      } = formData;
      const missingFields = [];

      if (!mngNum) missingFields.push("관리번호");
      if (!floor) missingFields.push("층");
      if (!teamNm) missingFields.push("사용부서");
      if (!manager) missingFields.push("관리자(정)");
      if (!subManager) missingFields.push("관리자(부)");
      if (!location) missingFields.push("위치");
      if (!productNm) missingFields.push("품명");
      if (!modelNm) missingFields.push("모델명");
      if (!sn) missingFields.push("S/N");
      if (!company) missingFields.push("제조사");
      if (!manuDate) missingFields.push("제조년월");
      if (!tonerNm) missingFields.push("토너(잉크)명");

      if (missingFields.length > 0) {
        alert(`다음 항목을 입력해주세요:\n${missingFields.join("\n")}`);
        return;
      }

      const requestData = {
        mngNum,
        floor,
        teamNm,
        manager,
        subManager,
        location,
        productNm,
        modelNm,
        sn,
        company,
        manuDate,
        tonerNm,
        price,
      };

      if (!editMode) {
        axios.post(`/api/toner/manage`, requestData, {
          params: {
            userId: auth.userId,  
            instCd: auth.instCd   
          },
          headers: {
            'Content-Type': 'application/json'
          }
        })
          .then(response => {
            onSave([response.data]);
            alert('항목이 성공적으로 추가되었습니다.');
            resetFormData();
            onClose();
          })
          .catch(error => {
            console.error('Error adding data:', error);
            alert('데이터 저장 중 오류가 발생했습니다.');
          });        
      } else {
        axios.put(`/api/toner/manage/${selectedData.mngNum}`, requestData, {
          params: {
            userId: auth.userId  
          },
          headers: {
            'Content-Type': 'application/json'
          }
        })
          .then(response => {
            onSave([response.data]);
            alert('항목이 성공적으로 수정되었습니다.');
            resetFormData();
            onClose();
          })
          .catch(error => {
            console.error('Error updating data:', error);
            alert('데이터 수정 중 오류가 발생했습니다.');
          });        
      }
    }
  };

  if (!show) return null;

  return (
    <div className="toner-modal-overlay">
      <div className="toner-modal-container">
        <div className="modal-header">
          <h3>{editMode ? "토너 항목 수정" : "토너 항목 추가"}</h3>
          <button className="toner-close-button" onClick={onClose}>
            X
          </button>
        </div>
        <div className="toner-instructions">
          {editMode
            ? "항목을 수정하세요."
            : "엑셀 파일 첨부 혹은 직접 입력으로 항목을 추가하세요."}
        </div>
        {!editMode && (
          <div className="toner-tab-container">
            <button
              className={`toner-tab ${activeTab === "text" ? "active" : ""}`}
              onClick={() => handleTabChange("text")}
            >
              직접 입력하기
            </button>
            <button
              className={`toner-tab ${activeTab === "file" ? "active" : ""}`}
              onClick={() => handleTabChange("file")}
            >
              파일 첨부하기
            </button>
          </div>
        )}
        <hr className="modal-tab-separator" />
        <div className="toner-modal-content">
          {!editMode && activeTab === "file" && (
            <div className="toner-add-section">
              <div className="toner-add-detail-row">
                <label>첨부파일 선택</label>
                <input
                  type="file"
                  name="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          )}
          {(editMode || activeTab === "text") && (
            <div className="toner-add-section">
              {tonerFormFields.map((field, index) => (
                <div className="toner-add-detail-row" key={index}>
                  <label>
                    {field.label} {field.isRequired && <span>*</span>}
                  </label>
                  <input
                    type="text"
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={handleChange}
                    placeholder={field.placeholder || ""}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="toner-modal-buttons">
          <button
            className="toner-modal-button confirm"
            onClick={handleSaveClick}
          >
            {editMode ? "수정하기" : "추가하기"}
          </button>
        </div>
      </div>
    </div>
  );
};

TonerInfoModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  editMode: PropTypes.bool,
  selectedData: PropTypes.object,
};

export default TonerInfoModal;
