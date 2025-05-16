import { useEffect, useState } from "react";

const GigaContainer = () => {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const askGigachat = (questionText: string) => {
        window.postMessage({
            type: "REQUEST_TO_GIGACHAT",
            question: questionText
        }, "*");
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim()) return;

        setIsLoading(true);
        askGigachat(question);
    };

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            // Проверяем, что сообщение от нашего расширения
            if (event.source !== window || !event.data.type) return;

            switch (event.data.type) {
                case "GIGACHAT_RESPONSE":
                    setIsLoading(false);
                    setAnswer(event.data.response || '');
                    break;

                case "GIGACHAT_ERROR":
                    setIsLoading(false);
                    setAnswer(`Ошибка: ${event.data.error}`);
                    break;

                default:
                    break;
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, []);

    return (
        <div>
            <h3>Giga API test</h3>

            <form onSubmit={handleSubmit}>
                <input 
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    disabled={isLoading}
                    placeholder="Ask Giga..."
                />

                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Отправка...' : 'Спросить'}
                </button>
            </form>

            <div>{answer}</div>
        </div>
    );
};

export default GigaContainer;
