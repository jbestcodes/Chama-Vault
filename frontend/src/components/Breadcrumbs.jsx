import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Breadcrumbs = ({ customCrumbs = [] }) => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  // Define breadcrumb labels for common routes
  const breadcrumbLabels = {
    '': 'Home',
    'login': 'Login',
    'register': 'Register',
    'why-us': 'Why Choose Us',
    'dashboard': 'Dashboard',
    'my-profile': 'My Profile',
    'savings-admin': 'Savings Admin',
    'table-banking-admin': 'Table Banking Admin',
    'table-banking-member': 'Table Banking',
    'loans-and-repayments': 'Loans & Repayments',
    'withdrawal-request': 'Withdrawal Request',
    'ai-dashboard': 'AI Dashboard',
    'performance': 'Performance',
    'terms-and-conditions': 'Terms & Conditions',
    'privacy-policy': 'Privacy Policy',
    'contact-us': 'Contact Us',
    'user-guide': 'User Guide',
    'subscribe': 'Subscribe'
  };

  // Combine default and custom breadcrumbs
  const crumbs = [
    { path: '/', label: 'Home' },
    ...pathnames.map((pathname, index) => {
      const path = `/${pathnames.slice(0, index + 1).join('/')}`;
      const customCrumb = customCrumbs.find(crumb => crumb.path === path);
      return {
        path,
        label: customCrumb?.label || breadcrumbLabels[pathname] || pathname.charAt(0).toUpperCase() + pathname.slice(1).replace('-', ' ')
      };
    })
  ];

  // Don't show breadcrumbs on home page
  if (location.pathname === '/') {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" style={{
      padding: '8px 0',
      fontSize: '14px',
      color: '#666'
    }}>
      <ol style={{
        listStyle: 'none',
        padding: 0,
        margin: 0,
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        {crumbs.map((crumb, index) => (
          <li key={crumb.path} style={{
            display: 'flex',
            alignItems: 'center'
          }}>
            {index > 0 && (
              <span style={{
                margin: '0 8px',
                color: '#ccc'
              }}>
                ›
              </span>
            )}
            {index === crumbs.length - 1 ? (
              <span style={{
                color: '#1976d2',
                fontWeight: '500'
              }}>
                {crumb.label}
              </span>
            ) : (
              <Link
                to={crumb.path}
                style={{
                  color: '#666',
                  textDecoration: 'none',
                  padding: '2px 4px',
                  borderRadius: '4px',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.color = '#1976d2'}
                onMouseLeave={(e) => e.target.style.color = '#666'}
              >
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>

      {/* Structured data for breadcrumbs */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": crumbs.map((crumb, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": crumb.label,
            "item": `https://jazanyumba.online${crumb.path}`
          }))
        })}
      </script>
    </nav>
  );
};

export default Breadcrumbs;