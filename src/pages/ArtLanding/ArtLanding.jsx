import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { IoArrowForward } from 'react-icons/io5';
import { useContent } from '../../context/ContentContext';
import './ArtLanding.css';

import art1 from '../../assets/art_1.png';
import art2 from '../../assets/art_2.png';
import art3 from '../../assets/art_3.png';

const defaultWorks = [
    {
        id: 1,
        title: 'Ethereal Silence',
        artist: 'Ajidhas',
        year: '2025',
        medium: 'Mixed Media on Canvas',
        image: art1,
    },
    {
        id: 2,
        title: 'Bronze Form No. 4',
        artist: 'Ajidhas',
        year: '2024',
        medium: 'Bronze Sculpture',
        image: art2,
    },
    {
        id: 3,
        title: 'Monolith',
        artist: 'Ajidhas',
        year: '2025',
        medium: 'Photography',
        image: art3,
    },
];

const ArtLanding = () => {
    const navigate = useNavigate();
    const { getText, getImage, wpContent } = useContent();

    const headerLabel = getText('art', 'header_label', 'Art Collection');
    const headerTitle = getText('art', 'header_title', 'Ajidhas & Associates');
    const headerSubtitle = getText('art', 'header_subtitle', 'Curated works from visionary artists');

    const recentWorks = (wpContent?.art?.items && Array.isArray(wpContent.art.items) && wpContent.art.items.length > 0)
        ? wpContent.art.items.map((item, idx) => ({
            id: idx + 1,
            title: item.title || defaultWorks[idx]?.title || 'Art Piece',
            artist: item.artist || defaultWorks[idx]?.artist || 'Ajidhas',
            year: item.year || defaultWorks[idx]?.year || '2025',
            medium: item.medium || defaultWorks[idx]?.medium || 'Mixed Media',
            image: item.image || getImage('art', idx, defaultWorks[idx]?.image || art1)
        }))
        : defaultWorks.map((item, idx) => ({
            ...item,
            image: getImage('art', idx, item.image)
        }));

    const [currentSlide, setCurrentSlide] = useState(0);
    const [autoPlay, setAutoPlay] = useState(true);
    const coverRef = useRef(null);
    const contentRef = useRef(null);

    useEffect(() => {
        const tl = gsap.timeline();

        if (coverRef.current) {
            tl.fromTo(
                coverRef.current,
                { scale: 1.1, opacity: 0 },
                { scale: 1, opacity: 1, duration: 1.5, ease: 'power3.out' }
            );
        }

        if (contentRef.current && contentRef.current.children.length > 0) {
            tl.fromTo(
                contentRef.current.children,
                { y: 80, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: 'power3.out' },
                '-=1'
            );
        }
    }, []);

    // Auto-play slider
    useEffect(() => {
        if (!autoPlay || recentWorks.length === 0) return;
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % recentWorks.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [autoPlay, recentWorks.length]);

    const currentWork = recentWorks[currentSlide] || recentWorks[0] || defaultWorks[0];

    return (
        <div className="art-landing-page-new">
            {/* Full-screen cover slide */}
            <div className="cover-slide" ref={coverRef}>
                <div className="cover-background">
                    <img src={currentWork.image} alt={currentWork.title} key={currentWork.id || currentSlide} />
                    <div className="cover-overlay"></div>
                </div>

                <div className="cover-content" ref={contentRef}>
                    <div className="cover-header">
                        <span className="cover-label">{headerLabel}</span>
                        <h1 className="cover-title">{headerTitle}</h1>
                        <p className="cover-subtitle">{headerSubtitle}</p>
                    </div>

                    <div className="featured-work">
                        <div className="work-badge">Featured Work</div>
                        <h2 className="work-title">{currentWork.title}</h2>
                        <p className="work-meta">
                            {currentWork.artist} • {currentWork.year} • {currentWork.medium}
                        </p>
                    </div>

                    <div className="cover-actions">
                        <button
                            className="cover-btn primary"
                            onClick={() => navigate('/art/gallery')}
                        >
                            <span>Gallery</span>
                            <IoArrowForward />
                        </button>
                        <button
                            className="cover-btn secondary"
                            onClick={() => navigate('/art/artist')}
                        >
                            <span>Artists</span>
                            <IoArrowForward />
                        </button>
                    </div>

                    <div className="slide-progress">
                        {recentWorks.map((_, idx) => (
                            <div
                                key={idx}
                                className={`progress-bar ${idx === currentSlide ? 'active' : ''} ${idx < currentSlide ? 'completed' : ''}`}
                                onClick={() => {
                                    setCurrentSlide(idx);
                                    setAutoPlay(false);
                                    setTimeout(() => setAutoPlay(true), 5000);
                                }}
                            >
                                <div className="progress-fill"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArtLanding;
