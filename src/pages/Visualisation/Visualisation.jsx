import React, { useState, useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Visualisation.css';

import buildingNight from '../../assets/building_night.png';
import bg2 from '../../assets/hero_bg_architecture.png';
import bg3 from '../../assets/home_bg.png';
import art1 from '../../assets/art_1.png';
import art2 from '../../assets/art_2.png';
import art3 from '../../assets/art_3.png';

gsap.registerPlugin(ScrollTrigger);

const projects = [
    {
        id: 1,
        title: 'Haus am See',
        category: 'RESIDENTIAL',
        image: art3,
        description: 'A minimalist retreat nestled by the serene waters, blending modern geometry with natural tranquility.'
    },
    {
        id: 2,
        title: 'Urban Loft',
        category: 'PROPERTY',
        image: bg2,
        description: 'Sophisticated industrial living in the heart of the city, featuring open spaces and raw material palettes.'
    },
    {
        id: 3,
        title: 'Alpine Retreat',
        category: 'HOSPITALITY',
        image: bg3,
        description: 'Luxury mountain lodging designed to withstand the elements while providing unparalleled warmth and comfort.'
    },
    {
        id: 4,
        title: 'Tech Hub',
        category: 'CORPORATE',
        image: art1,
        description: 'A futuristic workspace fostering innovation through dynamic architecture and integrated technology.'
    },
    {
        id: 5,
        title: 'Modern Villa',
        category: 'RESIDENTIAL',
        image: art2,
        description: 'A private sanctuary of clean lines and expansive glass, redefining the boundaries between indoor and outdoor living.'
    },
    {
        id: 6,
        title: 'City Center',
        category: 'PROPERTY',
        image: buildingNight,
        description: 'A landmark development revitalizing the urban core with sustainable design and vibrant public spaces.'
    },
    {
        id: 7,
        title: 'Glass Pavilion',
        category: 'RESIDENTIAL',
        image: art3,
        description: 'An ethereal structure of transparency and light, floating within a lush landscape.'
    },
    {
        id: 8,
        title: 'Sky Garden',
        category: 'CORPORATE',
        image: bg2,
        description: 'Elevated green spaces integrated into a high-rise office tower, promoting wellness and productivity.'
    },
    {
        id: 9,
        title: 'Ocean View',
        category: 'HOSPITALITY',
        image: bg3,
        description: 'A coastal resort that mimics the rhythm of the waves, offering panoramic vistas of the horizon.'
    },
    {
        id: 10,
        title: 'The Monolith',
        category: 'PROPERTY',
        image: art1,
        description: 'A bold architectural statement of solid form and precise shadow play.'
    },
    {
        id: 11,
        title: 'Zen Retreat',
        category: 'RESIDENTIAL',
        image: art2,
        description: 'A peaceful abode inspired by Eastern philosophy, focusing on balance, simplicity, and natural light.'
    },
    {
        id: 12,
        title: 'Future Lab',
        category: 'CORPORATE',
        image: art3,
        description: 'An experimental research facility where architecture serves as a catalyst for scientific discovery.'
    },
];

const Visualisation = () => {
    const scrollAreaRef = useRef(null);
    const projectRefs = useRef([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const isPausedRef = useRef(false);
    const activeIndexRef = useRef(0);
    const resumeTimerRef = useRef();
    const loopTimerRef = useRef();

    const setPaused = useCallback((paused) => {
        isPausedRef.current = paused;
    }, []);

    const scrollToIndex = useCallback((index) => {
        const target = projectRefs.current[index];
        const scrollArea = scrollAreaRef.current;
        if (target && scrollArea) {
            scrollArea.scrollTo({
                top: target.offsetTop,
                behavior: 'smooth'
            });
            activeIndexRef.current = index % projects.length;
            setActiveIndex(activeIndexRef.current);
        }
    }, []);

    // Auto-scrolling logic - Snap to next every 5 seconds
    useEffect(() => {
        const scrollArea = scrollAreaRef.current;
        if (!scrollArea) return;

        const advance = () => {
            if (isPausedRef.current) return;

            const nextIndex = activeIndexRef.current + 1;
            if (nextIndex >= projects.length) {
                scrollToIndex(nextIndex);
                loopTimerRef.current = window.setTimeout(() => {
                    scrollArea.scrollTo({ top: 0, behavior: 'auto' });
                    activeIndexRef.current = 0;
                    setActiveIndex(0);
                }, 800);
            } else {
                scrollToIndex(nextIndex);
            }
        };

        const intervalId = window.setInterval(advance, 5000);

        // Drag to scroll variables
        let isDragging = false;
        let startY;
        let scrollTop;

        const handleMouseDown = (e) => {
            isDragging = true;
            scrollArea.classList.add('grabbing');
            startY = e.pageY - scrollArea.offsetTop;
            scrollTop = scrollArea.scrollTop;
            setPaused(true);
        };

        const handleMouseLeave = () => {
            isDragging = false;
            scrollArea.classList.remove('grabbing');
            setPaused(false);
        };

        const handleMouseUp = () => {
            isDragging = false;
            scrollArea.classList.remove('grabbing');
            setPaused(false);

            // Snap to nearest section after drag
            const newIndex = Math.round(scrollArea.scrollTop / window.innerHeight);
            scrollToIndex(newIndex);
        };

        const handleMouseMove = (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const y = e.pageY - scrollArea.offsetTop;
            const walk = (y - startY) * 1.5;
            scrollArea.scrollTop = scrollTop - walk;
        };

        const handleWheel = () => {
            setPaused(true);
            clearTimeout(resumeTimerRef.current);
            resumeTimerRef.current = window.setTimeout(() => {
                setPaused(false);
            }, 3000);
        };

        const handleScroll = () => {
            const scrollArea = scrollAreaRef.current;
            if (!scrollArea) return;

            const scrollPos = scrollArea.scrollTop;
            const totalHeight = projects.length * window.innerHeight;

            // Seamless loop jump
            if (scrollPos >= totalHeight) {
                scrollArea.scrollTo({ top: 0, behavior: 'auto' });
                activeIndexRef.current = 0;
                setActiveIndex(0);
                return;
            }

            const index = Math.round(scrollPos / window.innerHeight);
            if (index !== activeIndexRef.current && index < projects.length) {
                activeIndexRef.current = index;
                setActiveIndex(index);
            }
        };

        scrollArea.addEventListener('mousedown', handleMouseDown);
        scrollArea.addEventListener('mouseleave', handleMouseLeave);
        scrollArea.addEventListener('mouseup', handleMouseUp);
        scrollArea.addEventListener('mousemove', handleMouseMove);
        scrollArea.addEventListener('wheel', handleWheel, { passive: true });
        scrollArea.addEventListener('scroll', handleScroll);

        return () => {
            clearInterval(intervalId);
            scrollArea.removeEventListener('mousedown', handleMouseDown);
            scrollArea.removeEventListener('mouseleave', handleMouseLeave);
            scrollArea.removeEventListener('mouseup', handleMouseUp);
            scrollArea.removeEventListener('mousemove', handleMouseMove);
            scrollArea.removeEventListener('wheel', handleWheel);
            scrollArea.removeEventListener('scroll', handleScroll);
            clearTimeout(resumeTimerRef.current);
            clearTimeout(loopTimerRef.current);
        };
    }, [scrollToIndex, setPaused]);

    useEffect(() => {
        const ctx = gsap.context(() => {
        const sections = gsap.utils.toArray('.vis-story-section');

        sections.forEach((section) => {
            const imageContainer = section.querySelector('.vis-story-image');
            const image = section.querySelector('.vis-story-image img');
            const content = section.querySelector('.vis-story-content');
            const title = section.querySelector('.vis-story-title');
            const desc = section.querySelector('.vis-story-desc');
            const cat = section.querySelector('.vis-story-cat');

            // 3D Cinematic Image Animation
            gsap.fromTo(imageContainer,
                {
                    rotationX: 45,
                    z: -500,
                    opacity: 0,
                    transformOrigin: "center bottom"
                },
                {
                    rotationX: 0,
                    z: 0,
                    opacity: 1,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: section,
                        start: "top bottom",
                        end: "top center",
                        scrub: true,
                        scroller: ".vis-scroll-area"
                    }
                }
            );

            gsap.to(imageContainer, {
                rotationX: -45,
                z: -500,
                opacity: 0,
                transformOrigin: "center top",
                ease: "power2.in",
                scrollTrigger: {
                    trigger: section,
                    start: "bottom center",
                    end: "bottom top",
                    scrub: true,
                    scroller: ".vis-scroll-area"
                }
            });

            // Inner Image Parallax & Scale
            gsap.fromTo(image,
                { scale: 1.5 },
                {
                    scale: 1,
                    duration: 2,
                    ease: "expo.out",
                    scrollTrigger: {
                        trigger: section,
                        start: "top 80%",
                        toggleActions: "play none none reverse",
                        scroller: ".vis-scroll-area"
                    }
                }
            );

            // 3D Content Animation
            gsap.fromTo(content,
                { rotationX: 20, z: -200, opacity: 0 },
                {
                    rotationX: 0, z: 0, opacity: 1,
                    duration: 1.5,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: section,
                        start: "top 70%",
                        toggleActions: "play none none reverse",
                        scroller: ".vis-scroll-area"
                    }
                }
            );

            // Text Entrance Animations
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: section,
                    start: "top 60%",
                    toggleActions: "play none none reverse",
                    scroller: ".vis-scroll-area"
                }
            });

            tl.fromTo(cat, { opacity: 0, y: 20, filter: "blur(5px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.6 })
                .fromTo(title, { opacity: 0, y: 30, filter: "blur(10px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.8 }, "-=0.4")
                .fromTo(desc, { opacity: 0, y: 20, filter: "blur(5px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.6 }, "-=0.4");
        });
        }, scrollAreaRef);

        return () => ctx.revert();
    }, []);

    return (
        <div className="vis-story-container">
            <div
                className="vis-scroll-area"
                ref={scrollAreaRef}
                data-lenis-prevent
            >
                {/* Render projects + a clone of the first one for seamless loop */}
                {[...projects, projects[0]].map((project, index) => (
                    <section
                        key={`${project.id}-${index}`}
                        className="vis-story-section"
                        ref={el => projectRefs.current[index] = el}
                    >
                        <div className="vis-story-image">
                            <img src={project.image} alt={project.title} />
                            <div className="vis-story-overlay"></div>
                        </div>

                        <div className="vis-story-content">
                            <span className="vis-story-cat">{project.category}</span>
                            <h2 className="vis-story-title">{project.title}</h2>
                            <p className="vis-story-desc">{project.description}</p>
                            <div className="vis-story-footer">
                                <span className="vis-story-index">
                                    {((index % projects.length) + 1).toString().padStart(2, '0')}
                                </span>
                                <div className="vis-story-line"></div>
                            </div>
                        </div>
                    </section>
                ))}
            </div>

            {/* Fixed Navigation/Logo Overlay */}
            <div className="vis-story-fixed">


                <div className="vis-story-nav">
                    {projects.map((_, i) => (
                        <button
                            key={i}
                            className={`vis-nav-dot ${activeIndex === i ? 'active' : ''}`}
                            onClick={() => scrollToIndex(i)}
                            aria-label={`Go to project ${i + 1}`}
                        >
                            <span className="dot-label">{(i + 1).toString().padStart(2, '0')}</span>
                        </button>
                    ))}
                </div>


            </div>
        </div>
    );
};

export default Visualisation;
