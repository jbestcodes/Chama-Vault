import React from 'react';

const Footer = ({ position = "relative" }) => {
    return (
        <footer className={`${position === "fixed" ? "fixed bottom-0 left-0 right-0" : ""} bg-white border-t border-gray-200 py-4 px-6`}>
            <div className="max-w-7xl mx-auto text-center">
                <p className="text-sm text-gray-600 mb-1">
                    © {new Date().getFullYear()} ChamaVault. Secure savings made simple.
                </p>
                <p className="text-xs text-gray-500">
                    Built with ❤️ by{' '}
                    <a 
                        href="https://jbestcodes.github.io/Portfolio-website/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
                    >
                        JBest Codes
                    </a>
                </p>
            </div>
        </footer>
    );
};

export default Footer;