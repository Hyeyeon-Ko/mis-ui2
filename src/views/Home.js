import React, { useState } from 'react';
import CircleButton from '../components/CircleButton';
import * as XLSX from 'xlsx';
import axios from 'axios';
import '../styles/Home.css';

function Home() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };
  const handleFileUpload = () => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const binaryStr = e.target.result;
        const workbook = XLSX.read(binaryStr, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: 4, 
        });
  
        const parsedData = jsonData.map(row => ({
          draftId: row[0],
          teamNm: row[1],
          docId: row[2],
          location: row[3],
          docNm: row[4],
          manager: row[5],
          subManager: row[6],
          storageYear: row[7],
          creationYear: row[8],
          transferDate: row[9],
          tsdraftNum: row[10],
          disposalDate: row[11],
          dpdraftNum: row[12],
        }));
  
        // draftId가 undefined인 항목을 제외한 유효한 데이터만 필터링
        const validData = parsedData.filter(item => item.draftId !== undefined);
  
        if (validData.length === 0) {
          alert("유효한 데이터가 없습니다.");
          return;
        }
  
        console.log("Filtered Valid Data: ", validData);  // 유효한 데이터를 로그로 출력
  
        setData(validData);
        
        // 유효한 데이터만 전송
        axios.post('http://localhost:9090/api/docstorage/upload', validData)
          .then(response => {
            console.log("Server Response: ", response.data);
          })
          .catch(error => {
            console.error('Error uploading data:', error);
          });
      };
      reader.readAsBinaryString(file);
    }
  };
    
  return (
    <div className="main-content">
      <div className="button-container">
        <CircleButton to="/api/bcd" label="명함신청" />
        <CircleButton to="/api/seal" label="인장관리" />
      </div>
      <div className="button-container">
        <CircleButton to="/api/corpDoc" label="법인서류" />
        <CircleButton to="/api/doc" label="문서수발신" />
      </div>

      {/* 파일 첨부 및 추가 버튼 */}
      <div className="file-upload-container">
        <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
        <button onClick={handleFileUpload}>추가</button>
      </div>
    </div>
  );
}

export default Home;
