import { useEffect } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { useAuthStore } from '../stores/authStore';
import { useNotificationStore } from '../stores/notificationStore';

export const useWebSocket = () => {
  const { user, token } = useAuthStore();
  const addNotification = useNotificationStore((state) => state.addNotification);

  useEffect(() => {
    if (!user || !token) return;

    const socket = new SockJS('http://localhost:8080/ws');
    const client = Stomp.over(socket);

    client.connect({ Authorization: `Bearer ${token}` }, () => {
      client.subscribe(`/user/${user.username}/queue/notifications`, (message) => {
        addNotification(message.body);
      });
    });

    return () => {
      if (client.connected) client.disconnect(() => {});
    };
  }, [user, token, addNotification]);
};
