import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useContent } from '../../context/ContentContext';
import './Home.css';

import terracottaHero from '../../assets/home_hero_terracotta.png';
import logoImg from '../../assets/logo.png';

const Home = () => {
    const { getText, getImage } = useContent();
    const navigate = useNavigate();

    const currentLogo = getImage('general', 'logo_url', logoImg);
    const heroTitle = getText('home', 'hero_title', 'Ajidhas and Associates');
    const heroSubtitle = getText('home', 'hero_subtitle', 'Architecture & Art Studio');
    const artBtnText = getText('home', 'art_button_text', 'Art');
    const archBtnText = getText('home', 'architecture_button_text', 'Architecture');

    return (
        <main className="home-page-new">
            <div className="home-background" aria-hidden="true">
                <img src={terracottaHero} alt="" className="hero-image" />
            </div>

            <section className="hero-section-new" aria-labelledby="home-title">
                <div className="hero-content-new">
                    <div className="hero-logo-3d">
                        <img src={currentLogo} alt="Ajidhas logo" className="hero-logo-face hero-logo-front" />
                        <img src={currentLogo} alt="" aria-hidden="true" className="hero-logo-face hero-logo-back" />
                    </div>
                    <h1 id="home-title">{heroTitle}</h1>
                    <p className="hero-subtitle">{heroSubtitle}</p>
                </div>

                <div className="hero-buttons" aria-label="Choose a discipline">
                    <button className="hero-btn" onClick={() => navigate('/art')}>
                        <span className="btn-text">{artBtnText}</span>
                        <span className="btn-arrow" aria-hidden="true">→</span>
                    </button>
                    <button className="hero-btn" onClick={() => navigate('/architecture')}>
                        <span className="btn-text">{archBtnText}</span>
                        <span className="btn-arrow" aria-hidden="true">→</span>
                    </button>
                </div>

                <aside className="hero-editorial-details" aria-hidden="true">
                    <div className="editorial-brand">Ajidhas</div>
                    <div className="editorial-manifesto">Spaces<br />Ideas<br />People<br />For a finer<br />tomorrow<i /></div>
                    <div className="editorial-location"><i />Chennai <em>/</em> Dubai</div>
                    <div className="editorial-index"><span>Intro</span><i /><strong>01</strong><b>•<br />•<br />•</b></div>
                    <div className="editorial-statement">Spaces for a finer tomorrow<i /></div>
                </aside>
            </section>
        </main>
    );
};

export default Home;
