import { useEffect } from 'react';

export function useHeartbeat() {
  useEffect(() => {
    const heartbeat = async () => {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        if (!supabaseUrl) return;

        const response = await fetch(
          `${supabaseUrl}/functions/v1/heartbeat`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.ok) {
          console.log('Heartbeat enviado com sucesso');
        }
      } catch (error) {
        console.error('Erro ao enviar heartbeat:', error);
      }
    };

    heartbeat();

    const interval = setInterval(heartbeat, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);
}
