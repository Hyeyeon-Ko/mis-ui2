import axios from 'axios';

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: 'http://kmi-mis-backend-1:8080', // API 개발서버
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json', // 필요에 따라 헤더 설정
  }
});

// POST 요청을 보내는 함수
const postData = async () => {
  const dataToSend = {
    // 보낼 데이터 객체
    id: 'clsung'
  };

  try {
    const response = await apiClient.post('/sample/sample', dataToSend);
    console.log('POST 요청 성공:', response.data);
    return response.data; // 성공적으로 데이터를 받은 경우 데이터 반환
  } catch (error) {
    if (error.response) {
      console.error('서버 응답 에러:', error.response.data);
    } else if (error.request) {
      console.error('응답 없음:', error.request);
    } else {
      console.error('요청 설정 에러:', error.message);
    }
    throw error; // 에러 발생 시 에러를 throw하여 처리
  }
};

export default postData;
