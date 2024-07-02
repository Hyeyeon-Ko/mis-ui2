import React, { useEffect, useState } from 'react';
import postData from '../services/api'; // POST 요청 함수 import

const MyComponent = () => {
  const [responseData, setResponseData] = useState(null);

  useEffect(() => {
    const sendPostRequest = async () => {
      try {
        const data = await postData();
        setResponseData(data.data);
      } catch (error) {
        console.error('Error while sending POST request:', error);
      }
    };

    sendPostRequest();
  }, []);

  return (
    <div>
      {responseData ? (
        <div>
          <p>Received data:</p>
          <pre>{JSON.stringify(responseData, null, 2)}</pre>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default MyComponent;
