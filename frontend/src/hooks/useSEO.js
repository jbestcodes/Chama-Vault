import { useEffect } from 'react';

const useSEO = ({
  title,
  description,
  keywords,
  image = 'https://jazanyumba.online/og-image.jpg',
  url = 'https://jazanyumba.online',
  type = 'website'
}) => {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update meta tags
    const updateMetaTag = (property, content) => {
      let element = document.querySelector(`meta[${property.startsWith('og:') || property.startsWith('twitter:') ? 'property' : 'name'}="${property}"]`);
      if (element) {
        element.setAttribute('content', content);
      } else {
        element = document.createElement('meta');
        element.setAttribute(property.startsWith('og:') || property.startsWith('twitter:') ? 'property' : 'name', property);
        element.setAttribute('content', content);
        document.head.appendChild(element);
      }
    };

    // Basic meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);

    // Open Graph tags
    updateMetaTag('og:title', title);
    updateMetaTag('og:description', description);
    updateMetaTag('og:image', image);
    updateMetaTag('og:url', url);
    updateMetaTag('og:type', type);

    // Twitter tags
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);
    updateMetaTag('twitter:url', url);

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', url);
    } else {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      canonical.setAttribute('href', url);
      document.head.appendChild(canonical);
    }

    // Structured data for the page
    const structuredData = {
      "@context": "https://schema.org",
      "@type": type === 'website' ? "WebPage" : "Article",
      "name": title,
      "description": description,
      "url": url,
      "publisher": {
        "@type": "Organization",
        "name": "Jaza Nyumba",
        "url": "https://jazanyumba.online"
      }
    };

    let script = document.querySelector('#page-structured-data');
    if (script) {
      script.textContent = JSON.stringify(structuredData);
    } else {
      script = document.createElement('script');
      script.id = 'page-structured-data';
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }

  }, [title, description, keywords, image, url, type]);
};

export default useSEO;