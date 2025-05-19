import { useNavigate } from "react-router-dom";

const Main = () => {
    const navigate = useNavigate();

    return (
        <div className="home-container">
            <h1>Добро пожаловать в видеочат с ботом</h1>
            <p>Присоединяйтесь к видеоконференции для взаимодействия с человеко-машинным интерфейсом</p>
            <button 
                onClick={() => navigate('/room')}
                className="join-button"
            >
                Присоединиться к конференции
            </button>
        </div>
    );
};

export default Main;
