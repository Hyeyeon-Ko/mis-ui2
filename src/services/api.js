import axios from 'axios';

// Axios 기본 설정
axios.defaults.baseURL = 'http://10.1.10.138:9090'; // api 개발서버
axios.defaults.timeout = 10000;

// POST 요청을 보내는 함수
const postData = async () => {
  const dataToSend = {
    // 보낼 데이터 객체
    id: 'clsung'
  };

  try {
    const response = await axios.post('/sample/sample', dataToSend);
    console.log('POST 요청 성공:', response.data);
    return response.data; // 성공적으로 데이터를 받은 경우 데이터 반환
  } catch (error) {
    console.error('POST 요청 실패:', error);
    throw error; // 에러 발생 시 에러를 throw하여 처리
  }
};

export default postData;
