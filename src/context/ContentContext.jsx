import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchSiteContent, fetchProjects, submitInquiry } from '../services/api';

const ContentContext = createContext(null);

export const ContentProvider = ({ children }) => {
    const [wpContent, setWpContent] = useState(null);
    const [wpProjects, setWpProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const loadAllData = async () => {
            const [contentData, projectsData] = await Promise.all([
                fetchSiteContent(),
                fetchProjects()
            ]);
            if (isMounted) {
                if (contentData) setWpContent(contentData);
                if (projectsData && projectsData.length > 0) setWpProjects(projectsData);
                setLoading(false);
            }
        };

        loadAllData();
        return () => { isMounted = false; };
    }, []);

    /**
     * Get dynamic text with fallback
     * @param {string} section - e.g. 'home', 'general', 'about', 'contact'
     * @param {string} key - e.g. 'hero_title', 'contact_email'
     * @param {string} fallback - local fallback string
     */
    const getText = (section, key, fallback = '') => {
        if (wpContent && wpContent[section] && wpContent[section][key]) {
            return wpContent[section][key];
        }
        return fallback;
    };

    /**
     * Get dynamic image or background image with fallback
     * @param {string} section - e.g. 'home', 'architecture', 'contact'
     * @param {string|number} keyOrIndex - e.g. 'bg_image' or 0, 1, 2 for array
     * @param {string} fallbackImg - imported local image asset
     */
    const getImage = (section, keyOrIndex, fallbackImg) => {
        if (!wpContent || !wpContent[section]) return fallbackImg;

        const val = wpContent[section];
        if (typeof keyOrIndex === 'number' && Array.isArray(val?.bg_images)) {
            return val.bg_images[keyOrIndex] || fallbackImg;
        }

        if (typeof keyOrIndex === 'string' && val[keyOrIndex]) {
            return val[keyOrIndex];
        }

        return fallbackImg;
    };

    /**
     * Get dynamic team members array with fallback
     */
    const getTeam = (fallbackTeam = []) => {
        if (wpContent?.about?.team && Array.isArray(wpContent.about.team) && wpContent.about.team.length > 0) {
            return wpContent.about.team.map((member, idx) => ({
                id: idx + 1,
                name: member.name || fallbackTeam[idx]?.name || 'Team Member',
                role: member.role || fallbackTeam[idx]?.role || 'Architect',
                image: member.image || fallbackTeam[idx]?.image,
                bio: member.bio || fallbackTeam[idx]?.bio || ''
            }));
        }
        return fallbackTeam;
    };

    return (
        <ContentContext.Provider value={{
            wpContent,
            wpProjects,
            loading,
            getText,
            getImage,
            getTeam,
            submitInquiry
        }}>
            {children}
        </ContentContext.Provider>
    );
};

export const useContent = () => {
    const context = useContext(ContentContext);
    if (!context) {
        return {
            wpContent: null,
            wpProjects: [],
            loading: false,
            getText: (_sec, _key, fallback) => fallback,
            getImage: (_sec, _key, fallbackImg) => fallbackImg,
            getTeam: (fallbackTeam) => fallbackTeam,
            submitInquiry: async () => ({ success: true })
        };
    }
    return context;
};
