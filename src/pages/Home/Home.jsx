import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Home.css';


import waitingHall from '../../assets/waiting_hall.jpeg';
import openingBuilding from '../../assets/building1.png';
import openingCloud from '../../assets/opening_cloud.png';

import introBg from '../../assets/bg1.png';
import penthouseReveal from '../../assets/penthouse_reveal.png';
import logoImg from '../../assets/logo.png';

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
    const heroRef = useRef(null);
    const textRef = useRef(null);
    const buttonsRef = useRef(null);
    const introRef = useRef(null);
    const buildingRef = useRef(null);
    const cloudLeftRef = useRef(null);
    const cloudRightRef = useRef(null);
    const introBgRef = useRef(null);
    const textAjidhasRef = useRef(null);
    const textAssociatesRef = useRef(null);

    const bgImageRef = useRef(null);
    const penthouseImageRef = useRef(null);
    const penthouseCloudLeftRef = useRef(null);
    const penthouseCloudRightRef = useRef(null);
    const penthouseTextLeftRef = useRef(null);
    const penthouseTextRightRef = useRef(null);
    const navigate = useNavigate();
    const [introFinished, setIntroFinished] = useState(false);
    const [showPenthouse, setShowPenthouse] = useState(false);

    useEffect(() => {
        // Disable scroll initially
        document.body.style.overflow = 'hidden';

        const ctx = gsap.context(() => {
            const tl = gsap.timeline();

            // Phase 1: Intro Animation (Auto)
            tl.set(introRef.current, { opacity: 1 })
                // 1. Background: Cinematic scale down + fade in
                .fromTo(introBgRef.current,
                    { opacity: 0, scale: 1.1 },
                    { opacity: 1, scale: 1, duration: 3, ease: 'power3.out' }
                )
                // 3. Building: Rises smoothly
                .fromTo(buildingRef.current,
                    { y: '80%', xPercent: -50, opacity: 0, scale: 0.95 },
                    { y: '0%', xPercent: -50, opacity: 1, scale: 1, duration: 2.5, ease: 'power3.out' },
                    '-=2.0'
                )
                // 4. Text: Cinematic blur reveal
                .fromTo(textAjidhasRef.current,
                    { x: '80px', opacity: 0, filter: 'blur(10px)' },
                    { x: '0%', opacity: 1, filter: 'blur(0px)', duration: 2, ease: 'power3.out' },
                    '-=1.5'
                )
                .fromTo(textAssociatesRef.current,
                    { x: '-80px', opacity: 0, filter: 'blur(10px)' },
                    { x: '0%', opacity: 1, filter: 'blur(0px)', duration: 2, ease: 'power3.out' },
                    '-=1.8'
                )
                // Pause for a moment to let the user absorb the scene
                .to({}, { duration: 0.5 })
                .call(() => {
                    document.body.style.overflow = 'auto';
                });

            // Phase 2: Scroll Animation (Cinematic Entry)
            const scrollTl = gsap.timeline({
                scrollTrigger: {
                    trigger: ".scroll-spacer",
                    start: "top top",
                    end: "bottom bottom",
                    scrub: 1.2,
                    onEnter: () => {
                        document.body.style.overflow = 'auto';
                    },
                    onLeave: () => {
                        document.body.style.overflow = 'hidden';
                        setShowPenthouse(true);

                        const penthouseTl = gsap.timeline({
                            onComplete: () => {
                                setIntroFinished(true);
                                setShowPenthouse(false);
                                document.body.style.overflow = 'auto';
                            }
                        });

                        penthouseTl.set([penthouseCloudLeftRef.current, penthouseCloudRightRef.current], { opacity: 0 });
                        penthouseTl.set(penthouseImageRef.current, { scale: 1.1 });

                        // Smooth cinematic zoom and reveal
                        penthouseTl.to(penthouseImageRef.current, {
                            scale: 2.2,
                            filter: 'brightness(1.05) contrast(1.05)',
                            duration: 3.5,
                            ease: 'power2.inOut'
                        });

                        penthouseTl.fromTo([penthouseTextLeftRef.current, penthouseTextRightRef.current],
                            { y: 30, opacity: 0, filter: 'blur(10px)' },
                            { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.5, stagger: 0.2, ease: 'power3.out' },
                            '>-1.5'
                        );

                        penthouseTl.to([penthouseTextLeftRef.current, penthouseTextRightRef.current], {
                            opacity: 0,
                            y: -20,
                            duration: 1.2,
                            ease: 'power2.inOut'
                        }, '+=0.8');

                        penthouseTl.to(penthouseImageRef.current, {
                            opacity: 0,
                            scale: 2.4,
                            duration: 1.2,
                            ease: 'power2.inOut'
                        }, '<');
                    },
                    onLeaveBack: () => {
                        setIntroFinished(false);
                    }
                }
            });

            scrollTl
                .to([textAjidhasRef.current, textAssociatesRef.current], {
                    opacity: 0,
                    y: -50,
                    filter: 'blur(10px)',
                    duration: 1.2,
                    ease: "power2.inOut"
                })
                .to(buildingRef.current, {
                    scale: 12,
                    yPercent: 30,
                    transformOrigin: "center 85%",
                    filter: 'blur(5px)',
                    opacity: 0,
                    duration: 2.5,
                    ease: "power3.in"
                }, "<0.2")
                .to(introBgRef.current, {
                    scale: 1.25,
                    opacity: 0,
                    duration: 2,
                    ease: "power2.in"
                }, "<")
                .to(introRef.current, {
                    backgroundColor: 'rgba(5, 5, 5, 0)',
                    duration: 0.5,
                    onComplete: () => {
                        gsap.set(introRef.current, { display: 'none' });
                    }
                }, "-=0.2");
        });

        return () => {
            document.body.style.overflow = 'auto';
            ctx.revert();
        };
    }, []);

    useEffect(() => {
        if (!introFinished) return;

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
                    delay: 0.1,
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
    }, [introFinished]);

    useEffect(() => {
        if (!introFinished) return;

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
    }, [introFinished]);

    return (
        <div className="home-page-new">
            <div className="scroll-spacer"></div>

            {/* Penthouse Reveal Overlay */}
            <div className={`penthouse-reveal-overlay ${showPenthouse ? 'active' : ''}`}>
                <img src={penthouseReveal} alt="Penthouse Reveal" className="penthouse-image" ref={penthouseImageRef} />
                <div className="penthouse-text-overlay">
                    <h2 className="penthouse-text left" ref={penthouseTextLeftRef}>AJIDHAS</h2>
                    <h2 className="penthouse-text right" ref={penthouseTextRightRef}>ASSOCIATES</h2>
                </div>
            </div>

            {/* Intro Animation Overlay */}
            <div className="intro-overlay" ref={introRef}>
                <img src={introBg} alt="Intro Background" className="intro-bg-image" ref={introBgRef} />

                {/* Animated Text */}
                <div className="intro-text-container">
                    <h1 className="intro-text intro-text-ajidhas" ref={textAjidhasRef}>AJIDHAS</h1>
                    <h1 className="intro-text intro-text-associates" ref={textAssociatesRef}>ASSOCIATES</h1>
                </div>

                <div className="building-container" ref={buildingRef}>
                    <img src={openingBuilding} alt="Building" className="intro-building" />
                </div>
            </div>

            <div className="home-background">
                <img
                    ref={bgImageRef}
                    src={waitingHall}
                    alt="Background"
                    className="bg-slide active"
                />
                <div className="home-overlay"></div>
            </div>

            <section className="hero-section-new" ref={heroRef}>
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
