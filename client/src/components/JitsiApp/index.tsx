import { useEffect, useRef } from "react";

declare global {
    interface Window {
        JitsiMeetExternalAPI: any;
    }
}

type IncomingMessage = {
    from: string;
    message: string;
    nick: string;
};

const JitsiApp = ({ roomName = 'master', displayName = 'User1' }) => {
    const jitsiContainerRef = useRef<HTMLDivElement>(null);
    const apiRef = useRef<any>(null);

    useEffect(() => {
        console.log('useEffect triggered');
        
        // Проверяем, что API загружено и конференция еще не запущена
        if (window.JitsiMeetExternalAPI && !apiRef.current) {
            console.log('Jitsi API already loaded, starting conference');
            startConference();
        } else if (!window.JitsiMeetExternalAPI) {
            console.log('Loading Jitsi API...');
            // Если API еще не загружено, загружаем динамически
            const script = document.createElement('script');
            script.src = 'https://meet.jit.si/external_api.js';
            script.onload = () => {
                console.log('Jitsi API loaded, starting conference');
                startConference();
            };
            document.body.appendChild(script);
        }

        // Очистка при размонтировании компонента
        return () => {
            console.log('Cleaning up...');
            if (apiRef.current) {
                apiRef.current.dispose();
                apiRef.current = null;
            }
        };
    }, []);

    const startConference = () => {
        try {
            console.log('Starting conference...');
            const domain = 'meet.jit.si';
            const options = {
                roomName: roomName,
                width: '100%',
                height: 660,
                parentNode: jitsiContainerRef.current,
                userInfo: {
                    displayName: displayName || 'Anonymous',
                },
                configOverwrite: {
                    startWithAudioMuted: true,
                    startWithVideoMuted: true,
                },
                interfaceConfigOverwrite: {
                    TOOLBAR_BUTTONS: [
                        'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                        'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
                        'shortcuts', 'tileview', 'select-background', 'download', 'help',
                        'mute-everyone', 'security'
                    ],
                }
            };

            apiRef.current = new window.JitsiMeetExternalAPI(domain, options);
            console.log('Jitsi API instance created');

            // Подписываемся на события
            apiRef.current.addListener('participantJoined', (data: any) => {
                console.log('Участник присоединился:', data);
            });

            apiRef.current.addListener('participantLeft', (data: any) => {
                console.log('Участник вышел:', data);
            });

            // Подписываемся на все возможные события чата
            apiRef.current.addListener('incomingMessage', (obj: IncomingMessage) => {
                console.log('---incomingMessage---', obj);
            });

            apiRef.current.addListener('message', (obj: any) => {
                console.log('---message event---', obj);
            });

            apiRef.current.addListener('chatMessage', (obj: any) => {
                console.log('---chatMessage event---', obj);
            });

            // Добавляем тестовое сообщение через 5 секунд после инициализации
            setTimeout(() => {
                try {
                    console.log('Sending test message...');
                    apiRef.current.executeCommand('sendChatMessage', 'Test message from API');
                } catch (error) {
                    console.error('Error sending test message:', error);
                }
            }, 5000);

            console.log('All event listeners added');

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
