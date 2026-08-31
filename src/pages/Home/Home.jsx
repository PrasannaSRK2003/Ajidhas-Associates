import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import './Home.css';


import waitingHall from '../../assets/waiting_hall.jpeg';
import logoImg from '../../assets/logo.png';

const Home = () => {
    const textRef = useRef(null);
    const buttonsRef = useRef(null);
    const bgImageRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline();
            tl.fromTo(
                textRef.current.children,
                { y: 40, opacity: 0, filter: 'blur(10px)' },
                {
                    y: 0,
                    opacity: 1,
                    filter: 'blur(0px)',
                    duration: 1.2,
                    stagger: 0.15,
                    ease: 'power3.out',
                }
            );

            tl.fromTo(
                buttonsRef.current.children,
                { y: 30, opacity: 0, scale: 0.9, filter: 'blur(5px)' },
                {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    filter: 'blur(0px)',
                    duration: 1,
                    stagger: 0.15,
                    ease: 'back.out(1.5)',
                },
                '-=0.8'
            );
        });

        return () => ctx.revert();
    }, []);

    useEffect(() => {
        let xTo = gsap.quickTo(textRef.current, "x", { duration: 0.8, ease: "power3" }),
            yTo = gsap.quickTo(textRef.current, "y", { duration: 0.8, ease: "power3" }),
            rotXTo = gsap.quickTo(textRef.current, "rotationX", { duration: 0.8, ease: "power3" }),
            rotYTo = gsap.quickTo(textRef.current, "rotationY", { duration: 0.8, ease: "power3" });

        let btnXTo = gsap.quickTo(buttonsRef.current, "x", { duration: 0.8, ease: "power3" }),
            btnYTo = gsap.quickTo(buttonsRef.current, "y", { duration: 0.8, ease: "power3" }),
            btnRotXTo = gsap.quickTo(buttonsRef.current, "rotationX", { duration: 0.8, ease: "power3" }),
            btnRotYTo = gsap.quickTo(buttonsRef.current, "rotationY", { duration: 0.8, ease: "power3" });

        let bgXTo = gsap.quickTo(bgImageRef.current, "x", { duration: 1, ease: "power2.out" }),
            bgYTo = gsap.quickTo(bgImageRef.current, "y", { duration: 1, ease: "power2.out" });

        const handleMouseMove = (e) => {
            const { clientX, clientY } = e;
            const x = (clientX / window.innerWidth) - 0.5;
            const y = (clientY / window.innerHeight) - 0.5;

            // Subtle rotation and positioning for elegance
            rotYTo(x * 10);
            rotXTo(-y * 10);
            xTo(x * 15);
            yTo(y * 15);

            btnRotYTo(x * 12);
            btnRotXTo(-y * 12);
            btnXTo(x * 20);
            btnYTo(y * 20);

            bgXTo(-x * 20);
            bgYTo(-y * 20);
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <div className="home-page-new">
            <div className="home-background">
                <img
                    ref={bgImageRef}
                    src={waitingHall}
                    alt="Background"
                    className="bg-slide active"
                />
                <div className="home-overlay"></div>
            </div>

            <section className="hero-section-new">
                <div className="hero-content-new" ref={textRef}>
                    <img src={logoImg} alt="Logo" className="hero-logo" />
                    <h1>Ajidhas and Associates</h1>
                    <p className="hero-subtitle">Architecture & Art Studio</p>
                </div>

                <div className="hero-buttons" ref={buttonsRef}>
                    <button className="hero-btn" onClick={() => navigate('/art')}>
                        <span className="btn-text">Art</span>
                        <span className="btn-arrow">→</span>
                    </button>
                    <button className="hero-btn" onClick={() => navigate('/architecture')}>
                        <span className="btn-text">Architecture</span>
                        <span className="btn-arrow">→</span>
                    </button>
                </div>
            </section>
        </div>
    );
};

export default Home;
