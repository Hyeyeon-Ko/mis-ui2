export const subscribeToNotifications = (userId, setNotifications) => {
    // TODO: 추후, 운영서버 주소로 변경
    const eventSource = new EventSource(`http://localhost:9090/api/noti/subscribe/${userId}`);
    
    eventSource.addEventListener('notification', (event) => {

      if (event.data && event.data.startsWith('{')) {
        try {
          const newNotification = JSON.parse(event.data);
  
          setNotifications((prevNotifications) => {
            const isDuplicate = prevNotifications.some((prevNoti) => prevNoti.id === newNotification.id);
  
            // 중복되지 않은 알림만 추가
            if (!isDuplicate) {
              const updatedNotifications = [...prevNotifications, newNotification];
              sessionStorage.setItem('notifications', JSON.stringify(updatedNotifications));
              return updatedNotifications;
            }
            return prevNotifications;
          });
        } catch (error) {
          console.error("Failed to parse SSE event data:", error);
        }
      }
    });

  eventSource.onerror = (e) => {
    console.error("SSE connection error:", e);
    eventSource.close();
  };

  return eventSource;
};

