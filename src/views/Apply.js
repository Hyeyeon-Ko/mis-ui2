import React from 'react';
// import * as XLSX from 'xlsx';
import CircleButton from '../components/CircleButton';
import '../styles/Apply.css';
// import axios from 'axios';


/* 메인페이지 */
function Apply() {
  // const [fileData, setFileData] = useState([]);

  // const handleFileChange = (event) => {
  //   const file = event.target.files[0];
  //   const reader = new FileReader();

  //   reader.onload = (event) => {
  //     const data = new Uint8Array(event.target.result);
  //     const workbook = XLSX.read(data, { type: 'array' });
  //     const sheetName = workbook.SheetNames[0];
  //     const worksheet = workbook.Sheets[sheetName];

  //     const jsonOptions = {
  //       header: 1,
  //       defval: '',
  //       raw: false,
  //       dateNF: 'yyyy-mm-dd',
  //     };

  //     const worksheetData = XLSX.utils.sheet_to_json(worksheet, jsonOptions);

  //     const extractedData = worksheetData
  //       .slice(2) 
  //       .filter((row) => row[0] === '구입' || row[0] === '구매') 
  //       .map((row) => ({
  //         mngNum: row[1], // 관리번호
  //         floor: row[2], // 층
  //         teamNm: row[3], // 사용부서
  //         manager: row[4], // 관리자(정)
  //         subManager: row[5], // 관리자(부)
  //         location: row[6], // 위치
  //         productNm: row[7], // 품명
  //         modelNm: row[8], // 모델명
  //         sn: row[9], // S/N
  //         company: row[10], // 제조사
  //         manuDate: row[11], // 제조년월
  //         tonerNm: row[14], // 토너(잉크)명
  //         price: row[16], // 단가
  //       }));

  //     setFileData(extractedData);

  //     sendTonerDataToBackend(extractedData);
  //   };

  //   reader.readAsArrayBuffer(file);
  // };

  // const sendTonerDataToBackend = async (data) => {
  //   try {
  //     const requestData = {
  //       details: data,
  //       instCd: '211', 
  //       userId: '2024060034'  
  //     };

  //     const response = await axios.post('/api/toner/excel', requestData);
  //     console.log('Response from backend:', response.data);
  //     alert('엑셀 데이터가 성공적으로 전송되었습니다.');
  //   } catch (error) {
  //     console.error('Error sending data to the backend:', error);
  //     alert('엑셀 데이터를 전송하는 중 오류가 발생했습니다.');
  //   }
  // };

  return (
    <div className="main-content">
      <div className="kmi-intro">
        <h1 class="kmi-title">
          <span>K</span>orea <span>M</span>edical <span>I</span>nstitute
        </h1>
        <p className="kmi-subtitle">
          글로벌 No.1 평생건강관리 파트너 KMI 입니다.<br />
          이용할 서비스를 선택하세요.
        </p>
      </div>

      <div className="button-container">
        <CircleButton to="/bcd" label="명함신청" />
        <CircleButton to="/doc" label="문서수발신" />
        <CircleButton to="/tonerApply" label="토너신청" />
      </div>
      {/* <div className="file-upload-section">
        <label htmlFor="file-upload">엑셀 파일 첨부하기</label>
        <input type="file" id="file-upload" accept=".xlsx, .xls" onChange={handleFileChange} />
      </div> */}
    </div>
  );
}

export default Apply;

  // return (
  //   <div className="main-content">
  //     <div className="button-container">
  //       <CircleButton to="/bcd" label="명함신청" />
  //       <CircleButton to="/seal" label="인장신청" />
  //       <CircleButton to="/corpDoc" label="법인서류" />
  //     </div>
  //     <div className="button-container">
  //       <CircleButton to="/doc" label="문서수발신" />
  //       <CircleButton to="/docstorage" label="문서이관/파쇄" />
  //     </div>

  //     <div className="file-upload-section">
  //       <label htmlFor="file-upload">엑셀 파일 첨부하기</label>
  //       <input type="file" id="file-upload" accept=".xlsx, .xls" onChange={handleFileChange} />
  //     </div>
  //   </div>
  // );
