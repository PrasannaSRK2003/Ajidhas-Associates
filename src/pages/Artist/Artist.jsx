import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Artist.css';
import artistImg from '../../assets/artist_new_profile.png';

gsap.registerPlugin(ScrollTrigger);

const Artist = () => {
    const sectionRef = useRef(null);
    const imageRef = useRef(null);
    const textRef = useRef(null);
    const containerRef = useRef(null);
    const statsRef = useRef(null);

    useEffect(() => {
        let handleMouseMove;
        const ctx = gsap.context(() => {
        // Entrance Animation
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top 80%',
                end: 'bottom 20%',
                toggleActions: 'play none none reverse',
            }
        });

        tl.fromTo(imageRef.current,
            { scale: 1.2, opacity: 0, rotateY: -20 },
            { scale: 1, opacity: 1, rotateY: 0, duration: 1.8, ease: 'expo.out' }
        )
            .fromTo('.artist-profile-img',
                { scale: 1.5 },
                { scale: 1, duration: 2.5, ease: 'expo.out' },
                '<'
            )
            .fromTo('.floating-shape',
                { scale: 0, opacity: 0 },
                { scale: 1, opacity: 0.1, duration: 1, stagger: 0.2, ease: 'back.out(1.7)' },
                '-=1.5'
            )
            .fromTo(textRef.current.children,
                { y: 40, opacity: 0, skewY: 2 },
                { y: 0, opacity: 1, skewY: 0, duration: 1, stagger: 0.1, ease: 'power4.out' },
                '-=1.2'
            );

        // Stats Counter Animation
        const statsItems = statsRef.current.querySelectorAll('.stat-number');
        statsItems.forEach(stat => {
            const targetValue = parseInt(stat.getAttribute('data-value'));
            gsap.fromTo(stat,
                { innerText: 0 },
                {
                    innerText: targetValue,
                    duration: 2,
                    snap: { innerText: 1 },
                    scrollTrigger: {
                        trigger: stat,
                        start: 'top 90%',
                    },
                    onUpdate: function () {
                        stat.innerText = Math.ceil(this.targets()[0].innerText) + '+';
                    }
                }
            );
        });

        // Mouse Move Parallax
        handleMouseMove = (e) => {
            const { clientX, clientY } = e;
            const xPos = (clientX / window.innerWidth - 0.5) * 40;
            const yPos = (clientY / window.innerHeight - 0.5) * 40;

            gsap.to(imageRef.current, {
                x: xPos * 0.5,
                y: yPos * 0.5,
                rotateY: xPos * 0.1,
                rotateX: -yPos * 0.1,
                duration: 1,
                ease: 'power2.out'
            });

            gsap.to('.floating-shape-1', {
                x: -xPos * 1.5,
                y: -yPos * 1.5,
                duration: 1.5,
                ease: 'power2.out'
            });

            gsap.to('.floating-shape-2', {
                x: xPos * 2,
                y: yPos * 2,
                duration: 2,
                ease: 'power2.out'
            });
        };

        window.addEventListener('mousemove', handleMouseMove);

        // Scroll Parallax for Image
        gsap.to('.artist-profile-img', {
            yPercent: 15,
            ease: 'none',
            scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true
            }
        });

        }, containerRef);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            ctx.revert();
        };
    }, []);

    return (
        <div className="artist-page" ref={containerRef}>
            {/* Decorative Background Elements */}
            <div className="floating-shape floating-shape-1"></div>
            <div className="floating-shape floating-shape-2"></div>
            <div className="bg-glow"></div>

            <section className="about-artist-section" ref={sectionRef}>
                <div className="container">
                    <div className="artist-grid">
                        <div className="artist-image-container" ref={imageRef}>
                            <div className="artist-profile-img-wrapper">
                                <img src={artistImg} alt="Artist" className="artist-profile-img" />
                                <div className="image-overlay"></div>
                                <div className="artist-name-overlay">
                                    <span className="overlay-firstname">Artist</span>
                                    <span className="overlay-lastname">Ajidhas</span>
                                </div>
                            </div>
                            <div className="image-frame-decoration"></div>
                        </div>

                        <div className="artist-details" ref={textRef}>
                            <div className="label-wrapper">
                                <span className="section-label">Visionary Creator</span>
                                <div className="label-line"></div>
                            </div>

                            <h2 className="section-title">About Artist</h2>
                            <h3 className="artist-name">Ajidhas</h3>

                            <div className="bio-wrapper">
                                <p className="artist-bio">
                                    Jeeshnu Ajidhas is an emerging artist with a deep-seated passion for art, which is vividly reflected in his work. His creations are not merely visual experiences but emotional expressions, capturing intricate feelings through his adept use of rich tones. He imbues his subjects with a striking physical presence, making his art both captivating and impactful.
                                </p>
                            </div>

                            <div className="philosophy-card">
                                <p className="artist-philosophy">
                                    "My art is an extension of my architectural practice—a search for balance in a
                                    world of chaos. Every stroke and every line is a step towards understanding the
                                    essence of our surroundings."
                                </p>
                            </div>

                            <div className="artist-stats" ref={statsRef}>
                                <div className="stat-item">
                                    <span className="stat-number" data-value="10">0+</span>
                                    <span className="stat-label">Exhibitions</span>
                                    <div className="stat-bar"></div>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-number" data-value="50">0+</span>
                                    <span className="stat-label">Artworks</span>
                                    <div className="stat-bar"></div>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-number" data-value="15">0+</span>
                                    <span className="stat-label">Awards</span>
                                    <div className="stat-bar"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Artist;
