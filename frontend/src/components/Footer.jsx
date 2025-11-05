import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-300 py-6 px-6 w-full">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center gap-4 text-center sm:text-left">
                    <div className="text-sm text-gray-800 font-semibold">
                        © {new Date().getFullYear()} ChamaVault. Secure savings made simple.
                    </div>
                    <div className="text-sm text-gray-700">
                        Built with ❤️ by{' '}
                        <a 
                            href="https://jbestcodes.github.io/Portfolio-website/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors duration-300"
                        >
                            JBest Codes
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;