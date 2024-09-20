export const subscribeToNotifications = (userId, setNotifications) => {
    const eventSource = new EventSource(`http://localhost:9090/api/noti/subscribe/${userId}`);
  
    eventSource.onopen = () => {
      console.log("SSE connection opened for user:", userId);
    };
  
    eventSource.addEventListener('notification', (event) => {
      console.log("New notification event:", event);

      if (event.data && event.data.startsWith('{')) {
        try {
          const newNotification = JSON.parse(event.data);
          console.log("newNoti: ", newNotification);
  
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

