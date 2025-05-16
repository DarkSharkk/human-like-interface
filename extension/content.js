// Функция для получения токена из расширения
async function getGigaChatToken() {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage({ type: 'GET_TOKEN' }, response => {
            resolve(response.token);
        });
    });
}

// Экспортируем функцию в глобальный контекст
window.getGigaChatToken = getGigaChatToken;

// Слушаем сообщения от веб-приложения
window.addEventListener('message', function(event) {
    // Проверяем, что сообщение от нашего приложения
    if (event.source !== window) return;
    
    if (event.data.type === 'REQUEST_TO_GIGACHAT') {
        // Пересылаем сообщение в фоновый скрипт
        chrome.runtime.sendMessage(
            { type: 'ASK_GIGACHAT', question: event.data.question },
            function(response) {
                // Отправляем ответ обратно в веб-приложение
                window.postMessage({
                    type: response.success ? 'GIGACHAT_RESPONSE' : 'GIGACHAT_ERROR',
                    response: response.answer,
                    error: response.error
                }, '*');
            }
        );
    }
}); 