import { useEffect, useState, useRef } from 'react';

declare global {
    interface Window {
        JitsiMeetExternalAPI: any;
    }
}

const CloneJitsiContainer = () => {
    const [messages, setMessages] = useState<string[]>([]);
    const jitsiContainerRef = useRef<HTMLDivElement>(null);
    const jitsiInstance = useRef<any>(null);

    // Инициализация Jitsi
    const initJitsi = () => {
        if (!window.JitsiMeetExternalAPI) {
            console.error('Jitsi API not loaded');
            return;
        }

        const domain = 'meet.jit.si';
        const options = {
            roomName: 'roombaClone',
            width: '100%',
            height: 700,
            parentNode: jitsiContainerRef.current,
            interfaceConfigOverwrite: {
                SHOW_CHROME_EXTENSION_BANNER: false,
            },
            configOverwrite: {
                disableSimulcast: false,
            },
        };

        jitsiInstance.current = new window.JitsiMeetExternalAPI(domain, options);

        window.japi = jitsiInstance.current;

        jitsiInstance.current.addListener('incomingMessage', handleMessage);
        jitsiInstance.current.addListener('outgoingMessage', handleMessage);
        jitsiInstance.current.addListener('endpointTextMessageReceived', handleMessage);

        jitsiInstance.current.addEventListener('raiseHandUpdated', handleChatUpdates);
    };

    const handleMessage = (event: any) => {
        debugger;
        console.log('New chat message:', event);

        // if (event?.message || event?.nick) {
        //     const newMessage = `${event.nick}: ${event.message}`;
        //     setMessages(prev => [...prev, newMessage]);
        //     console.log('New message:', newMessage);
        // }
    };

    // Загрузка Jitsi API
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://meet.jit.si/external_api.js';
        script.async = true;

        script.onload = () => {
            initJitsi();
        };

        document.body.appendChild(script);

        return () => {
            // Очистка
            if (jitsiInstance.current) {
                jitsiInstance.current.removeListener('incomingMessage', handleMessage);
                jitsiInstance.current.removeListener('outgoingMessage', handleMessage);
                jitsiInstance.current.dispose();
            }
            document.body.removeChild(script);
        };
    }, []);

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            <div ref={jitsiContainerRef} style={{ flex: 3 }} />

            <div style={{
                flex: 1,
                padding: '20px',
                background: '#f0f0f0',
                overflowY: 'auto'
            }}>
                <h3>Chat Messages:</h3>
                <ul>
                    {messages.map((msg, index) => (
                        <li key={index} style={{ margin: '8px 0' }}>{msg}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default CloneJitsiContainer;