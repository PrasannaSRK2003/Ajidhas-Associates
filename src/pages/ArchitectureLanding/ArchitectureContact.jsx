import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './ArchitectureContact.css';
import mapBg from '../../assets/dark_architectural_map.png';


const ArchitectureContact = () => {
  const containerRef = useRef(null);
  const formRef = useRef(null);
  const infoRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.fromTo(containerRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 1 }
    )
      .fromTo(infoRef.current,
        { x: -50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8 },
        '-=0.5'
      )
      .fromTo(formRef.current,
        { x: 50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8 },
        '-=0.6'
      );
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    alert('Message sent successfully!');
  };

  return (
    <div className="arch-contact-page" ref={containerRef}>


      <div className="contact-container">
        <div className="contact-header">
          <h1>Get in Touch</h1>
        </div>

        <div className="contact-content">
          <div className="contact-info" ref={infoRef}>
            <div className="info-group">
              <h3>Visit Us</h3>
              <p>Chennai, India</p>
            </div>

            <div className="info-group">
              <h3>Contact</h3>
              <p>
                <a href="mailto:ajidhassandassociates@gmail.com">ajidhassandassociates@gmail.com</a>
                <br />
                <a href="tel:+919790847621">+91 9790847621</a>
              </p>
            </div>

            <div className="info-group">
              <h3>Socials</h3>
              <div className="social-links">
                <a href="https://www.instagram.com/ajidhas_sand_associates/" target="_blank" rel="noreferrer">Instagram</a>
                <a href="https://www.linkedin.com/company/ajidhas-sand-associates/" target="_blank" rel="noreferrer">LinkedIn</a>

              </div>
            </div>
          </div>

          <div className="contact-form-wrapper" ref={formRef}>
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input type="text" id="name" required placeholder="Enter your name" />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input type="email" id="email" required placeholder="Enter your email" />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input type="text" id="subject" placeholder="Project Inquiry" />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea id="message" required placeholder="Tell us about your project..." rows="5"></textarea>
              </div>

              <button type="submit" className="submit-btn">
                Send Message
                <span className="btn-arrow">→</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="contact-map-section">
        <div className="map-background">
          <img src={mapBg} alt="Map" />
          <div className="map-overlay"></div>
        </div>

        <div className="map-content">
          <div className="map-top">
            <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="google-maps-link">
              look at google maps <span className="link-line"></span>
            </a>
          </div>

          <a
            href="https://maps.google.com"
            target="_blank"
            rel="noreferrer"
            className="location-button"
          >
            <span className="loc-dot"></span>
            Our Location
          </a>

          <div className="map-bottom">
            <h2 className="contact-us-text">Contact us</h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArchitectureContact;
