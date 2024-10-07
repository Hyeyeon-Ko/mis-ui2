import axios from 'axios';

// 환경 변수 API URL
// API 개발서버
const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: apiUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json', // 필요에 따라 헤더 설정
  }
});

// POST 요청을 보내는 함수
const postData = async (url, data) => {
  const dataToSend = data;

  try {
    const response = await apiClient.post(url, dataToSend);
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

const deleteData = async (url, data) => {
  const dataToSend = data;

  try {
    const response = await apiClient.deleteData(url, dataToSend);
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
