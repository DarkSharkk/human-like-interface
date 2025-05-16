// Функция для получения токена
function getToken() {
    return new Promise((resolve, reject) => {
        fetch('https://ngw.devices.sberbank.ru:9443/api/v2/oauth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                'RqUID': crypto.randomUUID(),
                'Authorization': 'Basic OTBjMGYyZWEtY2E0NC00YWRjLTlkZTItZTU0MWNjOTBkMWMxOjUxN2YyMmYzLTQwZDAtNDNjNy1iOThhLTMwMjZhODQ2NWE4YQ=='
            },
            body: new URLSearchParams({
                'scope': 'GIGACHAT_API_PERS'
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('HTTP ошибка: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            resolve(data.access_token);
        })
        .catch(error => {
            reject(new Error('Ошибка при получении токена: ' + error.message));
        });
    });
}

// Функция для отправки запроса к GigaChat API
async function askGigaChat(question) {
    try {
        // Получаем токен из хранилища
        const tokenData = await new Promise((resolve) => {
            chrome.storage.local.get(['gigachat_token'], resolve);
        });

        if (!tokenData.gigachat_token) {
            throw new Error('Токен не найден');
        }

        const response = await fetch('https://gigachat.devices.sberbank.ru/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenData.gigachat_token}`
            },
            body: JSON.stringify({
                model: "GigaChat",
                messages: [
                    {
                        role: "user",
                        content: question
                    }
                ],
                temperature: 0.7,
                max_tokens: 1000
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ошибка: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Ошибка при запросе к GigaChat:', error);
        throw error;
    }
}

// Обновляем обработчик сообщений
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'GET_TOKEN') {
        getToken()
            .then(token => {
                chrome.storage.local.set({ 'gigachat_token': token }, function() {
                    sendResponse({ success: true, token: token });
                });
            })
            .catch(error => {
                console.error('Ошибка при получении токена:', error);
                sendResponse({ success: false, error: error.message });
            });
        return true;
    }
    
    if (request.type === 'ASK_GIGACHAT') {
        askGigaChat(request.question)
            .then(answer => {
                sendResponse({ success: true, answer: answer });
            })
            .catch(error => {
                sendResponse({ success: false, error: error.message });
            });
        return true;
    }
}); 