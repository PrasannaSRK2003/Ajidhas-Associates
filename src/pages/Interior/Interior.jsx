import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import './Interior.css';

import buildingNight from '../../assets/building_night.png';
import villaLumiere from '../../assets/villa_lumiere.png';
import villaSolenne from '../../assets/villa_solenne.png';
import archProject1 from '../../assets/arch_project_1.png';

const interiors = [
    { id: 1, title: 'Go-to-urban', subtitle: 'Descubre la colección Evo', image: villaLumiere },
    { id: 2, title: 'Sublime', subtitle: 'Elegance in every detail', image: villaSolenne },
    { id: 3, title: 'Urban Echo', subtitle: 'Modern living spaces', image: archProject1 },
    { id: 4, title: 'Nightfall', subtitle: 'Shadows and light', image: buildingNight },
];

const Interior = () => {
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [nextIndex, setNextIndex] = useState(1);
    const [isAnimating, setIsAnimating] = useState(false);

    const titleRef = useRef(null);
    const subtitleRef = useRef(null);
    const counterRef = useRef(null);
    const bgRef = useRef(null);
    const nextTitleRef = useRef(null);

    useEffect(() => {
        // Initial animation
        const tl = gsap.timeline();
        tl.fromTo(titleRef.current, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out' })
            .fromTo(subtitleRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, '-=0.6')
            .fromTo(counterRef.current, { opacity: 0 }, { opacity: 1, duration: 0.8 }, '-=0.6')
            .fromTo(nextTitleRef.current, { x: 50, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8 }, '-=0.6');
    }, []);

    const changeSlide = useCallback(() => {
        if (isAnimating) return;
        setIsAnimating(true);

        const tl = gsap.timeline({
            onComplete: () => {
                const newIndex = (currentIndex + 1) % interiors.length;
                setCurrentIndex(newIndex);
                setNextIndex((newIndex + 1) % interiors.length);
                setIsAnimating(false);

                // Animate In
                gsap.fromTo([titleRef.current, subtitleRef.current, counterRef.current],
                    { x: 100, opacity: 0 },
                    { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out', stagger: 0.1 }
                );
            }
        });

        // Animate Out
        tl.to([titleRef.current, subtitleRef.current, counterRef.current], {
            x: -100,
            opacity: 0,
            duration: 0.6,
            ease: 'power3.in',
            stagger: 0.05
        });

        // BG Animation
        gsap.to(bgRef.current, {
            scale: 1.1,
            opacity: 0.4,
            duration: 0.6,
            yoyo: true,
            repeat: 1,
            onRepeat: () => {
                // This is where we'd ideally swap the image source if we had different images
            }
        });
    }, [currentIndex, isAnimating]);

    // Auto-slide effect
    useEffect(() => {
        const timer = setTimeout(changeSlide, 5000);

        return () => clearTimeout(timer);
    }, [changeSlide]);

    return (
        <div className="interior-container">
            <div className="interior-bg-wrapper">
                <img
                    ref={bgRef}
                    src={interiors[currentIndex].image}
                    alt="Background"
                    className="interior-bg"
                />
                <div className="interior-overlay"></div>
            </div>

            <div className="interior-content">
                <h1
                    ref={titleRef}
                    className="interior-title"
                    onClick={() => navigate('/architecture/interior/list', { state: { selectedId: interiors[currentIndex].id } })}
                    style={{ cursor: 'pointer' }}
                >
                    {interiors[currentIndex].title}
                </h1>
                <p ref={subtitleRef} className="interior-subtitle">{interiors[currentIndex].subtitle}</p>
                <div ref={counterRef} className="interior-counter">
                    0{currentIndex + 1}/0{interiors.length}
                </div>
            </div>

            <div className="interior-nav-right" onClick={changeSlide}>
                <span ref={nextTitleRef} className="nav-next-title">{interiors[nextIndex].title}</span>
                <button className="nav-btn-prof">
                    <div className="arrow-circle-next">→</div>
                </button>
            </div>
        </div>
    );
};

export default Interior;
