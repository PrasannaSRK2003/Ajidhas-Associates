import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { IoArrowBack, IoMailOutline } from 'react-icons/io5';
import './ProjectDetail.css';

import art1 from '../../assets/art_1.png';
import art2 from '../../assets/art_2.png';
import art3 from '../../assets/art_3.png';

gsap.registerPlugin(ScrollTrigger);

const projectData = {
    1: {
        title: 'Ethereal Silence',
        category: 'Series 01',
        year: '2025',
        artist: 'Ajidhas',
        description: 'An exploration of texture and void, capturing the silence of abandoned spaces. This series delves into the relationship between light and shadow in architectural remains.',
        mainImage: art1,
        gallery: [art1, art2, art3, art1, art2]
    },
    2: {
        title: 'Bronze Form No. 4',
        category: 'Series 02',
        year: '2024',
        artist: 'Ajidhas',
        description: 'A study in weight and balance, casting dramatic shadows that change with the light. The sculpture interacts with its environment, creating a dialogue between form and space.',
        mainImage: art2,
        gallery: [art2, art3, art1, art2, art3]
    },
    3: {
        title: 'Monolith',
        category: 'Series 03',
        year: '2025',
        artist: 'Ajidhas',
        description: 'High contrast architectural photography focusing on brutalist geometry. The series highlights the raw power of concrete and the precision of modern design.',
        mainImage: art3,
        gallery: [art3, art1, art2, art3, art1]
    }
};

const ProjectDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const project = projectData[id] || projectData[1];

    const heroRef = useRef(null);
    const galleryRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        window.scrollTo(0, 0);

        const ctx = gsap.context(() => {
        const tl = gsap.timeline();

        tl.fromTo('.hero-content > *',
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: 'power3.out' }
        );

        tl.fromTo('.hero-image-container',
            { scale: 1.1, opacity: 0 },
            { scale: 1, opacity: 1, duration: 1.5, ease: 'power3.out' },
            '-=1'
        );

        // Gallery animations
        gsap.fromTo('.gallery-section-title',
            { y: 50, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                scrollTrigger: {
                    trigger: '.gallery-section',
                    start: 'top 80%',
                }
            }
        );

        gsap.fromTo('.gallery-grid-item',
            { y: 100, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.8,
                stagger: 0.1,
                scrollTrigger: {
                    trigger: '.gallery-grid-detail',
                    start: 'top 80%',
                }
            }
        );

        }, containerRef);

        return () => ctx.revert();
    }, [id]);

    return (
        <div className="project-detail-page" ref={containerRef}>
            <div className="detail-dynamic-bg" style={{ backgroundImage: `url(${project.mainImage})` }}>
                <div className="bg-overlay-dark"></div>
            </div>

            <section className="project-hero" ref={heroRef}>
                <div className="hero-content">
                    <span className="project-category">{project.category}</span>
                    <h1 className="project-title">{project.title}</h1>
                    <div className="project-meta">
                        <div className="meta-item">
                            <span>Artist</span>
                            <p>{project.artist}</p>
                        </div>
                        <div className="meta-item">
                            <span>Year</span>
                            <p>{project.year}</p>
                        </div>
                    </div>
                    <p className="project-description">{project.description}</p>
                    <div className="project-actions">
                        <a href="mailto:ajidhas@gmail.com" className="inquire-link">
                            <IoMailOutline />
                            <span>Inquire about this series</span>
                        </a>
                        <button className="contact-project-btn" onClick={() => navigate('/architecture/contact')}>
                            Contact Us
                        </button>
                    </div>
                </div>
                <div className="hero-image-container">
                    <img src={project.mainImage} alt={project.title} />
                </div>
            </section>

            <section className="gallery-section" ref={galleryRef}>
                <div className="gallery-section-header">
                    <h2 className="gallery-section-title">Series Gallery</h2>
                    <div className="section-line"></div>
                </div>

                <div className="gallery-grid-detail">
                    {project.gallery.map((img, index) => (
                        <div key={index} className={`gallery-grid-item item-${index % 3}`}>
                            <img src={img} alt={`${project.title} - ${index}`} />
                        </div>
                    ))}
                </div>
            </section>

            <footer className="project-footer">
                <button className="next-project-btn" onClick={() => navigate(`/art/project/${(parseInt(id) % 3) + 1}`)}>
                    <span>Next Project</span>
                    <IoArrowBack style={{ transform: 'rotate(180deg)' }} />
                </button>
            </footer>
        </div>
    );
};

export default ProjectDetail;
