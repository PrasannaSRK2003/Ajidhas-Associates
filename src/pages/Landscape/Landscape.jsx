import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { IoClose } from 'react-icons/io5';
import './Landscape.css';

import bg1 from '../../assets/hero_bg_night.png';
import bg2 from '../../assets/hero_bg_architecture.png';
import bg3 from '../../assets/home_bg.png';
import art1 from '../../assets/art_1.png';
import art2 from '../../assets/art_2.png';

// Define a cluster of items that will be repeated
const clusterItems = [
    { id: 1, title: "Silent Peaks", desc: "A serene exploration of mountain architecture.", width: 220, height: 280, top: '10%', left: '5%' },
    { id: 2, title: "Urban Flow", desc: "Capturing the movement of city life.", width: 260, height: 180, top: '25%', left: '45%' },
    { id: 3, title: "Desert Mirage", desc: "Heat and light playing tricks on the eye.", width: 200, height: 200, top: '60%', left: '15%' },
    { id: 4, title: "Forest Edge", desc: "Where nature meets structure.", width: 240, height: 300, top: '50%', left: '70%' },
    { id: 5, title: "Ocean View", desc: "Infinite horizons and calming blues.", width: 180, height: 220, top: '15%', left: '80%' },
    { id: 6, title: "Night Lights", desc: "The city comes alive after dark.", width: 200, height: 160, top: '75%', left: '40%' },
];

const Landscape = () => {
    const trackRef = useRef(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const modalImgRef = useRef(null);
    const modalDetailsRef = useRef(null);

    useEffect(() => {
        // Marquee Animation
        const track = trackRef.current;
        const totalWidth = track.scrollWidth / 2; // Assuming 2 sets

        // Reset position
        gsap.set(track, { x: 0 });

        // Continuous Loop
        const marquee = gsap.to(track, {
            x: -totalWidth, // Move left by half the total width (one full set)
            duration: 30, // Adjust speed
            ease: "none",
            repeat: -1,
            modifiers: {
                x: gsap.utils.unitize(x => parseFloat(x) % totalWidth) // Seamless wrapping
            }
        });

        // Floating Animation for individual items
        const items = document.querySelectorAll('.land-item');
        items.forEach((item) => {
            gsap.to(item, {
                y: '+=15',
                duration: 2 + Math.random() * 2,
                yoyo: true,
                repeat: -1,
                ease: 'sine.inOut',
                delay: Math.random()
            });
        });

        return () => {
            marquee.kill();
        };
    }, []);

    const handleItemClick = (item) => {
        setSelectedItem(item);
    };

    const handleCloseModal = () => {
        // Animate out
        const tl = gsap.timeline({
            onComplete: () => setSelectedItem(null)
        });
        tl.to([modalImgRef.current, modalDetailsRef.current], {
            y: 30,
            opacity: 0,
            duration: 0.3,
            ease: 'power2.in'
        });
    };

    // Animate Modal In
    useEffect(() => {
        if (selectedItem) {
            const tl = gsap.timeline();
            tl.to(modalImgRef.current, {
                y: 0,
                opacity: 1,
                duration: 0.6,
                ease: 'power3.out',
                delay: 0.1
            })
                .to(modalDetailsRef.current, {
                    y: 0,
                    opacity: 1,
                    duration: 0.6,
                    ease: 'power3.out'
                }, '-=0.4');
        }
    }, [selectedItem]);

    // Map IDs to images cyclically
    const getImage = (id) => {
        const images = [bg1, bg2, bg3, art1, art2];
        return images[(id - 1) % images.length];
    };

    return (
        <div className="landscape-container">
            {/* Back button removed as requested */}

            <div className="land-center-content">
                <h1 className="land-title">Landscape</h1>

            </div>

            <div className="land-marquee-wrapper">
                <div className="land-track" ref={trackRef}>
                    {/* Render multiple clusters for length */}
                    {[0, 1, 2].map((setIndex) => (
                        <div key={setIndex} className="land-cluster">
                            {clusterItems.map((item) => (
                                <div
                                    key={`${setIndex}-${item.id}`}
                                    className="land-item"
                                    style={{
                                        width: `${item.width}px`,
                                        height: `${item.height}px`,
                                        top: item.top,
                                        left: item.left,
                                    }}
                                    onClick={() => handleItemClick({ ...item, image: getImage(item.id) })}
                                >
                                    <img src={getImage(item.id)} alt={item.title} />
                                    <div className="land-item-overlay">
                                        <span className="land-item-title">{item.title}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Full Screen Modal */}
            <div className={`land-modal ${selectedItem ? 'active' : ''}`}>
                {selectedItem && (
                    <>
                        <img src={selectedItem.image} alt="bg" className="land-modal-bg" />
                        <button className="land-modal-close" onClick={handleCloseModal}>
                            <IoClose />
                        </button>
                        <div className="land-modal-content">
                            <div className="land-modal-inner">
                                <div className="land-modal-img-wrapper" ref={modalImgRef}>
                                    <img src={selectedItem.image} alt={selectedItem.title} />
                                </div>
                                <div className="land-modal-details" ref={modalDetailsRef}>
                                    <h2 className="land-modal-title">{selectedItem.title}</h2>
                                    <p className="land-modal-desc">{selectedItem.desc}</p>
                                    <div className="land-modal-meta">
                                        <div className="land-meta-item">
                                            <h4>Location</h4>
                                            <p>Switzerland</p>
                                        </div>
                                        <div className="land-meta-item">
                                            <h4>Year</h4>
                                            <p>2024</p>
                                        </div>
                                        <div className="land-meta-item">
                                            <h4>Type</h4>
                                            <p>Landscape</p>
                                        </div>
                                        <div className="land-meta-item">
                                            <h4>Photographer</h4>
                                            <p>Marcel E.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Landscape;
