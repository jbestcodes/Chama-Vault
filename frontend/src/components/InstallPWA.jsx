import React, { useState, useEffect } from 'react';

const InstallPWA = () => {
    const [installPrompt, setInstallPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [showIOSInstructions, setShowIOSInstructions] = useState(false);

    useEffect(() => {
        // Check if device is iOS
        const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        setIsIOS(isIOSDevice);

        // Check if already installed
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                            window.navigator.standalone === true;

        // Don't show if already installed
        if (isStandalone) {
            return;
        }

        // Check if user previously dismissed the prompt
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        const dismissedTime = localStorage.getItem('pwa-install-dismissed-time');
        
        // Show again after 7 days if dismissed
        if (dismissed && dismissedTime) {
            const daysSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24);
            if (daysSinceDismissed < 7) {
                return;
            }
        }

        // For non-iOS devices, listen for beforeinstallprompt
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setInstallPrompt(e);
            setShowPrompt(true);
            
            // Track Android prompt shown
            if (window.gtag) {
                window.gtag('event', 'pwa_prompt_shown', {
                    event_category: 'PWA',
                    event_label: 'Android Prompt',
                    platform: 'Android'
                });
            }
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // For iOS, show manual instructions after a delay
        if (isIOSDevice && !isStandalone) {
            setTimeout(() => {
                setShowPrompt(true);
                
                // Track iOS prompt shown
                if (window.gtag) {
                    window.gtag('event', 'pwa_prompt_shown', {
                        event_category: 'PWA',
                        event_label: 'iOS Prompt',
                        platform: 'iOS'
                    });
                }
            }, 5000); // Show after 5 seconds
        }

        // Track if user is already using installed PWA
        if (isStandalone && window.gtag) {
            window.gtag('event', 'pwa_launched', {
                event_category: 'PWA',
                event_label: 'App Already Installed',
                value: 1
            });
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!installPrompt) {
            if (isIOS) {
                setShowIOSInstructions(true);
                // Track iOS instruction view
                if (window.gtag) {
                    window.gtag('event', 'pwa_ios_instructions_shown', {
                        event_category: 'PWA',
                        event_label: 'iOS Instructions Viewed'
                    });
                }
            }
            return;
        }

        // Show the install prompt
        installPrompt.prompt();

        // Wait for the user's response
        const { outcome } = await installPrompt.userChoice;
        
        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
            setShowPrompt(false);
            
            // Track successful PWA install in Google Analytics
            if (window.gtag) {
                window.gtag('event', 'pwa_install_accepted', {
                    event_category: 'PWA',
                    event_label: 'App Installed',
                    value: 1
                });
            }
        } else {
            console.log('User dismissed the install prompt');
            
            // Track PWA install rejection
            if (window.gtag) {
                window.gtag('event', 'pwa_install_dismissed', {
                    event_category: 'PWA',
                    event_label: 'Install Dismissed'
                });
            }
        }

        // Clear the install prompt
        setInstallPrompt(null);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        setShowIOSInstructions(false);
        localStorage.setItem('pwa-install-dismissed', 'true');
        localStorage.setItem('pwa-install-dismissed-time', Date.now().toString());
        
        // Track prompt dismissal
        if (window.gtag) {
            window.gtag('event', 'pwa_prompt_dismissed', {
                event_category: 'PWA',
                event_label: 'Prompt Closed'
            });
        }
    };

    if (!showPrompt) {
        return null;
    }

    return (
        <>
            {/* Main Install Prompt */}
            <div 
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#4F46E5',
                    color: 'white',
                    padding: '16px 20px',
                    borderRadius: '12px',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                    zIndex: 9999,
                    maxWidth: '90%',
                    width: '400px',
                    animation: 'slideUp 0.3s ease-out'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '32px' }}>📱</div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
                            Install Jaza Nyumba
                        </h3>
                        <p style={{ margin: '4px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
                            {isIOS 
                                ? 'Add to your home screen for quick access'
                                : 'Install our app for a better experience'
                            }
                        </p>
                    </div>
                </div>

                <div style={{ 
                    display: 'flex', 
                    gap: '10px', 
                    marginTop: '12px',
                    justifyContent: 'flex-end'
                }}>
                    <button
                        onClick={handleDismiss}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            border: 'none',
                            borderRadius: '6px',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500'
                        }}
                    >
                        Not Now
                    </button>
                    <button
                        onClick={handleInstallClick}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            color: '#4F46E5',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 'bold'
                        }}
                    >
                        {isIOS ? 'Show Me How' : 'Install'}
                    </button>
                </div>
            </div>

            {/* iOS Instructions Modal */}
            {showIOSInstructions && (
                <div
                    onClick={handleDismiss}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        zIndex: 10000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px'
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            backgroundColor: 'white',
                            borderRadius: '16px',
                            padding: '24px',
                            maxWidth: '400px',
                            width: '100%',
                            maxHeight: '80vh',
                            overflow: 'auto'
                        }}
                    >
                        <h2 style={{ 
                            margin: '0 0 16px 0', 
                            fontSize: '20px',
                            color: '#1F2937'
                        }}>
                            Install Jaza Nyumba on iOS
                        </h2>

                        <div style={{ 
                            backgroundColor: '#F3F4F6',
                            borderRadius: '12px',
                            padding: '16px',
                            marginBottom: '16px'
                        }}>
                            <p style={{ 
                                margin: '0 0 16px 0',
                                fontSize: '14px',
                                color: '#4B5563',
                                lineHeight: '1.6'
                            }}>
                                Follow these simple steps to add Jaza Nyumba to your home screen:
                            </p>

                            <ol style={{ 
                                margin: 0,
                                paddingLeft: '20px',
                                fontSize: '14px',
                                color: '#1F2937',
                                lineHeight: '1.8'
                            }}>
                                <li>
                                    Tap the <strong>Share</strong> button 
                                    <span style={{ fontSize: '20px', margin: '0 4px' }}>
                                        {navigator.userAgent.includes('Safari') ? '⬆️' : '📤'}
                                    </span> 
                                    in Safari
                                </li>
                                <li>
                                    Scroll down and tap <strong>"Add to Home Screen"</strong>
                                    <span style={{ fontSize: '20px', margin: '0 4px' }}>➕</span>
                                </li>
                                <li>
                                    Tap <strong>"Add"</strong> in the top right corner
                                </li>
                                <li>
                                    The app icon will appear on your home screen!
                                </li>
                            </ol>
                        </div>

                        <button
                            onClick={handleDismiss}
                            style={{
                                width: '100%',
                                padding: '12px',
                                backgroundColor: '#4F46E5',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                        >
                            Got It!
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slideUp {
                    from {
                        transform: translateX(-50%) translateY(100px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(-50%) translateY(0);
                        opacity: 1;
                    }
                }
            `}</style>
        </>
    );
};

export default InstallPWA;
