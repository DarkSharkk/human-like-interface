import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

// Обработка подключений
io.on('connection', (socket) => {
    console.log('Клиент подключен');

    socket.on('playVideo', async (videoUrl: string) => {
        console.log('Получен запрос на воспроизведение видео:', videoUrl);
        try {
            // Просто отправляем URL видео клиенту
            socket.emit('startVideo', videoUrl);
        } catch (error) {
            console.error('Ошибка воспроизведения видео:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            socket.emit('error', errorMessage);
        }
    });

    socket.on('videoEnded', () => {
        console.log('Клиент сообщил об окончании видео');
    });

    socket.on('disconnect', () => {
        console.log('Клиент отключен');
    });
});

// Инициализация и запуск сервера
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`Video server running on port ${PORT}`);
}); 