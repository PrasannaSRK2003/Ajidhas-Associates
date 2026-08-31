import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { IoChevronBackOutline, IoChevronForwardOutline } from 'react-icons/io5';
import './About.css';

import team1 from '../../assets/team_1.png';
import team2 from '../../assets/team_2.png';
import team3 from '../../assets/team_3.png';
import team4 from '../../assets/team_4.png';

const teamMembers = [
    {
        id: 1,
        name: "Ajidhas",
        role: "Principal Architect",
        image: team1,
        bio: "A visionary leader with over 15 years of experience in sustainable urban design. Ajidhas leads the studio with a commitment to harmonizing modern architecture with the natural environment, creating spaces that inspire and endure."
    },
    {
        id: 2,
        name: "Pradeep",
        role: "Creative Director",
        image: team2,
        bio: "Pradeep brings a unique artistic perspective to every project. His expertise in spatial storytelling and material innovation ensures that each design is not just a building, but a visually poetic experience."
    },
    {
        id: 3,
        name: "Sarah Chen",
        role: "Lead Designer",
        image: team3,
        bio: "Sarah specializes in minimalist residential architecture. Her work is characterized by clean lines, functional elegance, and a deep understanding of how light transforms interior spaces."
    },
    {
        id: 4,
        name: "Marcus Vane",
        role: "Technical Lead",
        image: team4,
        bio: "Marcus bridges the gap between complex engineering and architectural beauty. He ensures that our most ambitious designs are structurally sound and technologically advanced."
    }
];

const About = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const containerRef = useRef(null);
    const requestRef = useRef();
    const cardRefs = useRef([]);
    const rotationRef = useRef(0);
    const isPausedRef = useRef(false);
    const activeIndexRef = useRef(0);
    const applyRotationRef = useRef(() => {});

    const total = teamMembers.length;
    const angleStep = 360 / total;

    useEffect(() => {
        const applyRotation = () => {
            const rotation = rotationRef.current;
            const normalizedRotation = ((-rotation % 360) + 360) % 360;
            const index = Math.round(normalizedRotation / angleStep) % total;

            if (index !== activeIndexRef.current) {
                activeIndexRef.current = index;
                setActiveIndex(index);
            }

            cardRefs.current.forEach((card, cardIndex) => {
                if (!card) return;

                const currentAngle = (angleStep * cardIndex + rotation) % 360;
                const angleRad = (currentAngle * Math.PI) / 180;
                const radiusX = 350;
                const radiusZ = 400;
                const x = Math.sin(angleRad) * radiusX;
                const z = Math.cos(angleRad) * radiusZ;
                const normalizedZ = (z + radiusZ) / (2 * radiusZ);

                gsap.set(card, {
                    x,
                    z,
                    scale: normalizedZ * 0.5 + 0.5,
                    rotationY: -Math.sin(angleRad) * 30,
                    zIndex: Math.round(z + radiusZ),
                    opacity: normalizedZ * 0.8 + 0.2,
                    filter: `blur(${(1 - normalizedZ) * 8}px)`,
                });
            });
        };
        applyRotationRef.current = applyRotation;

        const animate = () => {
            if (!isPausedRef.current) {
                rotationRef.current -= 0.2;
                applyRotation();
            }
            requestRef.current = requestAnimationFrame(animate);
        };

        applyRotation();
        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current);
    }, [angleStep, total]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Initial Entrance
            gsap.from(".about-v2-left", { x: -50, opacity: 0, duration: 1.5, ease: "expo.out" });
            gsap.from(".about-v2-right", { x: 50, opacity: 0, duration: 1.5, ease: "expo.out" });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Professional Text Fade-in with Blur
            gsap.fromTo(".member-info-content > *",
                {
                    y: 20,
                    opacity: 0,
                    filter: "blur(10px)"
                },
                {
                    y: 0,
                    opacity: 1,
                    filter: "blur(0px)",
                    duration: 1.2,
                    stagger: 0.15,
                    ease: "power4.out"
                }
            );

            // Background Text Animation
            gsap.fromTo(".bg-text-overlay span",
                { x: 100, rotationY: 15, opacity: 0 },
                { x: 0, rotationY: 0, opacity: 0.03, duration: 2, ease: "power3.out" }
            );
        }, containerRef);

        return () => ctx.revert();
    }, [activeIndex]);

    const handleNext = () => {
        rotationRef.current -= angleStep;
        const index = ((activeIndexRef.current + 1) % total);
        activeIndexRef.current = index;
        setActiveIndex(index);
        applyRotationRef.current();
    };

    const handlePrev = () => {
        rotationRef.current += angleStep;
        const index = (activeIndexRef.current - 1 + total) % total;
        activeIndexRef.current = index;
        setActiveIndex(index);
        applyRotationRef.current();
    };

    const activeMember = teamMembers[activeIndex];

    return (
        <div
            className="about-v2-container"
            ref={containerRef}
            onMouseEnter={() => { isPausedRef.current = true; }}
            onMouseLeave={() => { isPausedRef.current = false; }}
        >
            <div className="about-v2-content">
                {/* Left Side: Information */}
                <div className="about-v2-left">
                    <div className="member-info-content" key={activeMember.id}>
                        <span className="member-role-tag">{activeMember.role}</span>
                        <h1 className="member-name-title">{activeMember.name}</h1>
                        <div className="member-bio-container">
                            <p className="member-bio-text">{activeMember.bio}</p>
                        </div>

                        <div className="member-nav-controls">
                            <button className="nav-btn prev" onClick={handlePrev}>
                                <IoChevronBackOutline />
                            </button>
                            <div className="nav-counter">
                                <span className="current">{(activeIndex + 1).toString().padStart(2, '0')}</span>
                                <span className="separator">/</span>
                                <span className="total">{teamMembers.length.toString().padStart(2, '0')}</span>
                            </div>
                            <button className="nav-btn next" onClick={handleNext}>
                                <IoChevronForwardOutline />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Side: Circular Image Rotation */}
                <div className="about-v2-right">
                    <div className="team-circular-ring">
                        {teamMembers.map((member, index) => (
                            <div
                                key={member.id}
                                className={`team-member-card-3d ${activeIndex === index ? 'active' : ''}`}
                                ref={el => { cardRefs.current[index] = el; }}
                            >
                                <div className="member-image-wrapper">
                                    <img src={member.image} alt={member.name} className="member-main-img" />
                                    <div className="image-overlay-gradient"></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Background Decorative Text */}
                    <div className="bg-text-overlay">
                        <span>{activeMember.name.split(' ')[0]}</span>
                    </div>
                </div>
            </div>

            {/* Bottom Progress Bar */}
            <div className="about-progress-container">
                {teamMembers.map((_, i) => (
                    <div
                        key={i}
                        className={`progress-dot ${i === activeIndex ? 'active' : ''}`}
                        onClick={() => {
                            const targetRotation = -i * angleStep;
                            rotationRef.current = targetRotation;
                            activeIndexRef.current = i;
                            setActiveIndex(i);
                            applyRotationRef.current();
                        }}
                    >
                        <div className="progress-fill"></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default About;
