import { useEffect, useRef } from "react";

const JitsiApp = ({ roomName = 'master', displayName = 'User1' }) => {
    const jitsiContainerRef = useRef(null);
    const apiRef = useRef(null);

    useEffect(() => {
        // Проверяем, что API загружено
        if (window.JitsiMeetExternalAPI && !apiRef.current) {
            startConference();
        } else {
            // Если API еще не загружено, загружаем динамически
            const script = document.createElement('script');
            script.src = 'https://meet.jit.si/external_api.js';
            script.onload = startConference;
            document.body.appendChild(script);
        }

        return () => {
            // Уничтожаем Jitsi при размонтировании
            if (apiRef.current) {
                apiRef.current.dispose();
            }
        };
    }, [roomName, displayName]);

    const startConference = () => {
        try {
            const domain = 'meet.jit.si';
            const options = {
                roomName: roomName,
                width: '100%',
                height: 660,
                parentNode: jitsiContainerRef.current,
                userInfo: {
                    displayName: displayName || 'Anonymous',
                },
            };

            apiRef.current = new window.JitsiMeetExternalAPI(domain, options);

            // Подписываемся на события
            apiRef.current.addListener('participantJoined', (data) => {
                console.log('Участник присоединился:', data);
            });

            apiRef.current.addListener('participantLeft', (data) => {
                console.log('Участник вышел:', data);
            });

            apiRef.current.addListener('videoConferenceJoined', (data) => {
                console.log('Вы вошли в конференцию:', data);
            });

            apiRef.current.addListener('videoConferenceLeft', () => {
                console.log('Вы вышли из конференции');
            });

            // events test
            apiRef.current.addListener('audioMuteStatusChanged', () => console.log(12));

            apiRef.current.addListener('endpointTextMessageReceived', () => console.log('endpointTextMessageReceived'))

        } catch (error) {
            console.error('Ошибка при запуске Jitsi:', error);
        }
    };

    return (
        <div style={{ width: '800px', height: '600px', margin: '20px auto' }}>
            <h2>Конференция: {roomName}</h2>
            <div ref={jitsiContainerRef} style={{ height: '100%' }} />
        </div>
    );
};

export default JitsiApp;
