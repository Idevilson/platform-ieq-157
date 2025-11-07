import { Link } from "react-router-dom";
import "../styles/Home.css";
import logoIEQ from "../imagens/only-logo.png";
import pastoresImg from "../imagens/pr-heitor-e-pra-val.png";

function Home() {
  return (
    <div className="home-container">
      <div className="home-content">
        <div className="pastores-section">
          <div className="pastores-wrapper">
            <img src={logoIEQ} alt="Logo da Igreja do Evangelho Quadrangular - Símbolos da Cruz, Pomba, Cálice e Coroa" className="home-logo-watermark" />
            <img src={pastoresImg} alt="Pastor Heitor Alexandre e Pastora Val Nery - Líderes do Encontro com Deus 2025 em Redenção-PA" className="pastores-img" />
            <div className="bottom-flare"></div>
          </div>
        </div>

        <h1 className="home-title">Igreja do Evangelho Quadrangular</h1>
        <h2 className="home-subtitle">REDENÇÃO - PA: CAPITAL DO AVIVAMENTO</h2>

        <Link to="/encontro-com-deus" className="home-button">
          <span className="button-icon">✨</span>
          Encontro com Deus
          <span className="button-arrow">→</span>
        </Link>
      </div>
    </div>
  );
}

export default Home;
