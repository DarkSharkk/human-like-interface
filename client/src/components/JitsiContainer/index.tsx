import { JitsiMeeting } from "@jitsi/react-sdk";
import { IJitsiMeetExternalApi } from "@jitsi/react-sdk/lib/types";
import { useEffect, useState } from "react";

export const JitsiContainer = () => {
    const [messages, setMessages] = useState<string[]>([]);
    const [jitsi, setJitsi] = useState<any>(null);

    // Обработчик входящих сообщений
    const handleChatUpdates = (event: any) => {
        debugger;
        console.log('New chat message:', event);

        // if (event?.message || event?.nick) {
        //     const newMessage = `${event.nick}: ${event.message}`;
        //     setMessages(prev => [...prev, newMessage]);
        //     console.log('New chat message:', newMessage);
        // }
    };

    // Инициализация Jitsi
    const handleApiReady = (api: IJitsiMeetExternalApi) => {
        setJitsi(api);
        window.japi = api;

        api.addEventListener('incomingMessage', handleChatUpdates);
        api.addEventListener('outgoingMessage', handleChatUpdates);
        api.addEventListener('endpointTextMessageReceived', handleChatUpdates);

        // для проверки
        api.addEventListener('raiseHandUpdated', handleChatUpdates);

        // api.on('endpointTextMessageReceived', handleChatUpdates);
    };

    return (
        <div style={{ height: '60vh', width: '80vh' }}>
            <JitsiMeeting
                roomName="roomba"
                configOverwrite={{
                    startWithAudioMuted: true,
                    disableModeratorIndicator: true,
                }}
                onApiReady={handleApiReady}
                getIFrameRef={(iframe) => {
                    iframe.style.height = '100%';
                }}
            />
        </div>
    );
};