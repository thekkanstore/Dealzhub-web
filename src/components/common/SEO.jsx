import React, { useEffect } from 'react';

/**
 * SEO Component for DealzHub
 * Manages document title, meta tags, OpenGraph, Twitter tags, canonical URLs,
 * and JSON-LD structured data for rich search engine indexing.
 */
const SEO = ({
  title,
  description = 'DealzHub - Discover the best deals, local shops, and products across Kerala. Shop smart and support local businesses.',
  keywords = 'dealzhub, kerala shopping, local stores, best deals kerala, online marketplace kerala, local businesses',
  image = 'https://dealzhub.co.in/appLogo@2x.png',
  url = 'https://dealzhub.co.in',
  type = 'website',
  schema = null,
  robots = 'index, follow',
}) => {
  const fullTitle = title ? `${title} | DealzHub` : 'DealzHub - Kerala\'s Local Shopping & Deals Marketplace';
  const siteUrl = 'https://dealzhub.co.in';
  const canonicalUrl = url.startsWith('http') ? url : `${siteUrl}${url.startsWith('/') ? url : `/${url}`}`;
  const fullImageUrl = image.startsWith('http') ? image : `${siteUrl}${image.startsWith('/') ? image : `/${image}`}`;

  useEffect(() => {
    // 1. Set document title
    document.title = fullTitle;

    // Helper to update or create meta tags
    const setMetaTag = (attrName, attrValue, content) => {
      if (!content) return;
      let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Helper to update or create link tags (e.g. canonical)
    const setLinkTag = (rel, href) => {
      if (!href) return;
      let element = document.querySelector(`link[rel="${rel}"]`);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    // Standard Meta Tags
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'keywords', keywords);
    setMetaTag('name', 'robots', robots);
    setLinkTag('canonical', canonicalUrl);

    // OpenGraph Tags
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:image', fullImageUrl);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:type', type);
    setMetaTag('property', 'og:site_name', 'DealzHub');

    // Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', fullImageUrl);

    // JSON-LD Structured Data Schema
    let scriptElement = document.getElementById('dealzhub-json-ld');
    if (schema) {
      if (!scriptElement) {
        scriptElement = document.createElement('script');
        scriptElement.id = 'dealzhub-json-ld';
        scriptElement.type = 'application/ld+json';
        document.head.appendChild(scriptElement);
      }
      scriptElement.text = JSON.stringify(schema);
    } else if (scriptElement) {
      scriptElement.remove();
    }

    return () => {
      // Cleanup script tag on unmount if needed
      const currentScript = document.getElementById('dealzhub-json-ld');
      if (currentScript) {
        currentScript.remove();
      }
    };
  }, [fullTitle, description, keywords, fullImageUrl, canonicalUrl, type, schema, robots]);

  return null;
};

export default SEO;
