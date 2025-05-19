import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { didService } from "../../services/didService";
import styles from "./styles.module.css";

declare global {
    interface Window {
        JitsiMeetExternalAPI: any;
    }
    
    interface HTMLVideoElement {
        captureStream(): MediaStream;
    }
}

type IncomingMessage = {
    from: string;
    message: string;
    nick: string;
};

const VIDEO_SERVER_URL = import.meta.env.VITE_VIDEO_SERVER_URL || 'http://localhost:3001';

const JitsiApp = ({ roomName = 'miemmaster', displayName = 'User1' }) => {
    const jitsiContainerRef = useRef<HTMLDivElement>(null);
    const apiRef = useRef<any>(null);
    const socketRef = useRef<Socket | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const createVirtualVideoStream = async (videoUrl: string): Promise<MediaStream> => {
        const video = document.createElement('video');
        video.src = videoUrl;
        video.autoplay = true;
        // video.muted = true; // Важно для работы с MediaStream
        
        // Добавляем стили для позиционирования
        video.style.position = 'fixed';
        video.style.top = '50%';
        video.style.left = '50%';
        video.style.transform = 'translate(-50%, -50%)';
        video.style.zIndex = '1000';
        video.style.width = '640px';
        video.style.height = '360px';
        video.style.objectFit = 'contain';
        video.style.backgroundColor = 'black';
        
        document.body.appendChild(video);

        // Ждем загрузки видео
        await new Promise((resolve) => {
            video.onloadedmetadata = resolve;
        });

        const stream = video.captureStream();
        
        videoRef.current = video;

        return stream;
    };

    const stopVideoStream = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.src = '';
            videoRef.current.remove();
            videoRef.current = null;
        }
    };

    useEffect(() => {
        console.log('Инициализация сокета...');
        socketRef.current = io(VIDEO_SERVER_URL);

        socketRef.current.on('connect', () => {
            console.log('Сокет подключен к видео-серверу');
        });

        socketRef.current.on('connect_error', (error) => {
            console.error('Ошибка подключения к видео-серверу:', error);
        });

        socketRef.current.on('startVideo', async (url: string) => {
            console.log('Получен URL видео:', url);
            try {
                const stream = await createVirtualVideoStream(url);
                streamRef.current = stream;

                // Включаем видео в Jitsi
                if (apiRef.current) {
                    await apiRef.current.executeCommand('toggleVideo');
                    await apiRef.current.executeCommand('setVideoInputDevice', stream);
                }

                // Отслеживаем окончание видео
                if (videoRef.current) {
                    videoRef.current.onended = async () => {
                        console.log('Видео закончилось');

                        stopVideoStream();
                        // Затем удаляем видео элемент
                        if (videoRef.current) {
                            videoRef.current.remove();
                            videoRef.current = null;
                        }
                        setIsProcessing(false);
                        if (apiRef.current) {
                            await apiRef.current.executeCommand('toggleVideo');
                        }
                    };
                }
            } catch (error) {
                console.error('Ошибка при создании видео-потока:', error);
                setIsProcessing(false);
                // В случае ошибки тоже удаляем видео
                if (videoRef.current) {
                    videoRef.current.remove();
                    videoRef.current = null;
                }
            }
        });

        socketRef.current.on('error', (error: Error) => {
            console.error('Ошибка видео-сервера:', error);
            setIsProcessing(false);
            stopVideoStream();
        });

        return () => {
            console.log('Отключение сокета...');
            stopVideoStream();
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    useEffect(() => {
        const handleGigaResponse = async (event: MessageEvent) => {
            if (event.source !== window || !event.data.type) return;

            switch (event.data.type) {
                case "GIGACHAT_RESPONSE":
                    try {
                        console.log('Получен ответ от GigaChat:', event.data.response);
                        setIsProcessing(true);
                        
                        // Отправляем ответ в чат
                        if (apiRef.current) {
                            await apiRef.current.executeCommand('sendChatMessage', 'Обрабатываю ответ.');
                        }
                        
                        console.log('Создаем клип...');
                        const clipId = await didService.createClip(event.data.response);
                        console.log('Клип создан, ID:', clipId);
                        
                        console.log('Ожидаем готовности клипа...');
                        const videoUrl = await didService.waitForClip(clipId);
                        console.log('Получен URL видео:', videoUrl);
                        
                        if (socketRef.current) {
                            console.log('Отправляем запрос на воспроизведение видео...');
                            socketRef.current.emit('playVideo', videoUrl);
                            
                            socketRef.current.on('videoEnded', () => {
                                console.log('Воспроизведение видео завершено');
                                setIsProcessing(false);
                            });
                            
                            socketRef.current.on('error', (error: string) => {
                                console.error('Ошибка при воспроизведении видео:', error);
                                setIsProcessing(false);
                                if (apiRef.current) {
                                    apiRef.current.executeCommand('sendChatMessage', `Ошибка воспроизведения: ${error}`);
                                }
                            });
                        } else {
                            console.error('Сокет не инициализирован');
                            setIsProcessing(false);
                        }
                    } catch (error) {
                        console.error('Ошибка обработки ответа GigaChat:', error);
                        setIsProcessing(false);
                        if (apiRef.current) {
                            const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
                            apiRef.current.executeCommand('sendChatMessage', `Ошибка: ${errorMessage}`);
                        }
                    }
                    break;

                case "GIGACHAT_ERROR":
                    console.error('Ошибка GigaChat:', event.data.error);
                    if (apiRef.current) {
                        apiRef.current.executeCommand('sendChatMessage', `Ошибка: ${event.data.error}`);
                    }
                    break;
            }
        };

        window.addEventListener("message", handleGigaResponse);
        return () => window.removeEventListener("message", handleGigaResponse);
    }, []);

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

            apiRef.current.addListener('videoConferenceJoined', () => {
                console.log('Conference fully initialized, adding event listeners');
                
                apiRef.current.addListener('participantJoined', (data: any) => {
                    console.log('Участник присоединился:', data);
                });

                apiRef.current.addListener('participantLeft', (data: any) => {
                    console.log('Участник вышел:', data);
                });

                apiRef.current.addListener('incomingMessage', (obj: IncomingMessage) => {
                    console.log('---incomingMessage---', obj);
                    if (!isProcessing) {
                        window.postMessage({
                            type: "REQUEST_TO_GIGACHAT",
                            question: obj.message
                        }, "*");
                    }
                });

                console.log('All event listeners added');
            });

        } catch (error) {
            console.error('Ошибка при запуске Jitsi:', error);
        }
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.container} ref={jitsiContainerRef} />
            {isProcessing && !streamRef.current && (
                <div className={styles.loader}>
                    Обработка ответа...
                </div>
            )}
        </div>
    );
};

export default JitsiApp;
