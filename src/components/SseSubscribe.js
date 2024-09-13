export const subscribeToNotifications = (userId, setNotifications) => {
    const eventSource = new EventSource(`http://localhost:9090/api/noti/subscribe/${userId}`);
  
    eventSource.onopen = () => {
      console.log("SSE connection opened for user:", userId);
    };
  
    eventSource.addEventListener('notification', (event) => {
      console.log("New notification event:", event);

      if (event.data && event.data.startsWith('{')) { // Ensure it's JSON
        try {
          const newNotification = JSON.parse(event.data);

          setNotifications((prevNotifications) => {
            const updatedNotifications = [...prevNotifications, newNotification];
            sessionStorage.setItem('notifications', JSON.stringify(updatedNotifications)); // Store in sessionStorage
            return updatedNotifications;
          });
        } catch (error) {
          console.error("Failed to parse SSE event data:", error);
        }
      } else {
        console.warn("Received non-JSON event data:", event.data);
      }
    });
  
    eventSource.onerror = (e) => {
      console.error("SSE connection error:", e);
      eventSource.close();
    };
  
    return eventSource;
  };