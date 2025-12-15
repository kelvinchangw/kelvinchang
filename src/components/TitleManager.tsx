import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

export default function TitleManager() {
    const location = useLocation();

    useEffect(() => {
        let title = 'Kelvin Chang';
        
        switch(location.pathname) {
            case '/':
                break;  // Keep as Kelvin Chang
            case '/projects':
                title = 'Projects';
                break;
            case '/blog':
                title = 'Blog';
                break;
            case '/about':
                title = 'About';
                break;
        }
        
        document.title = title;
    }, [location]);

    return null;  // This component doesn't render anything
}