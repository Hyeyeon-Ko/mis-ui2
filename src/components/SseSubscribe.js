export const subscribeToNotifications = (userId, setNotifications) => {
    const eventSource = new EventSource(`http://localhost:9090/api/noti/subscribe/${userId}`);
  
    eventSource.onopen = () => {
      console.log("SSE connection opened for user:", userId);
    };
  
    eventSource.addEventListener('notification', (event) => {
      console.log("New notification event:", event);

      try {
        const newNotification = JSON.parse(event.data); // JSON 데이터 파싱
  
        setNotifications((prevNotifications) => {
            const updatedNotifications = [...prevNotifications, newNotification];
            sessionStorage.setItem('notifications', JSON.stringify(updatedNotifications)); // 세션 스토리지에 저장
            return updatedNotifications;
        });
      } catch (error) {
        console.error("Failed to parse SSE event data:", error);
      }
    });
  
    eventSource.onerror = (e) => {
      console.error("SSE connection error:", e);
      eventSource.close();
    };
  
    return eventSource;
  };