import { useEffect } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { useAuthStore } from '../stores/authStore';
import { useNotificationStore } from '../stores/notificationStore';

function playPip() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch {
    // ignore — context may be blocked before user gesture
  }
}

export const useWebSocket = () => {
  const { user, token } = useAuthStore();
  const addNotification = useNotificationStore((state) => state.addNotification);

  useEffect(() => {
    if (!user || !token) return;

    const socket = new SockJS('http://localhost:8080/ws');
    const client = Stomp.over(socket);
    client.debug = () => {};  // silence verbose STOMP logs

    client.connect({ Authorization: `Bearer ${token}` }, () => {
      client.subscribe(`/user/${user.username}/queue/notifications`, (message) => {
        try {
          const payload = JSON.parse(message.body);
          // payload is a NotificationPayload object
          if (payload.type === 'NOUVELLE_VISITE') {
            playPip();
            addNotification(
              `Nouveau visiteur : ${payload.visiteurNom} — Badge ${payload.badgeCode} — ${payload.motifLibelle}`
            );
          } else if (payload.type === 'CONFIRMATION_AGENT') {
            // Just store for the confirmation modal (already shown synchronously via API response)
            addNotification(
              `Visite confirmée : ${payload.visiteurNom} → ${payload.fonctionnaireNom} (${payload.serviceNom}) — Badge ${payload.badgeCode}`
            );
          } else {
            addNotification(message.body);
          }
        } catch {
          // fallback: plain string notification
          addNotification(message.body);
        }
      });
    });

    return () => {
      if (client.connected) client.disconnect(() => {});
    };
  }, [user, token, addNotification]);
};
