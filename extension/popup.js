document.addEventListener('DOMContentLoaded', function() {
    const getTokenButton = document.getElementById('getToken');
    const statusDiv = document.getElementById('status');

    getTokenButton.addEventListener('click', () => {
        getTokenButton.disabled = true;
        statusDiv.textContent = 'Получение токена...';
        statusDiv.className = '';

        // Отправляем сообщение в background script
        chrome.runtime.sendMessage({ type: 'GET_TOKEN' }, response => {
            if (response.success) {
                statusDiv.textContent = 'Токен успешно получен и сохранен!';
                statusDiv.className = 'success';
            } else {
                statusDiv.textContent = `Ошибка: ${response.error}`;
                statusDiv.className = 'error';
            }
            getTokenButton.disabled = false;
        });
    });
}); 