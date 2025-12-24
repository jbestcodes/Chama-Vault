import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Navbar from './Navbar';
import InstallPWA from './components/InstallPWA';
import Breadcrumbs from './components/Breadcrumbs';
import useAutoLogout from './hooks/useAutoLogout';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// Lazy load components for better performance
import Home from "./pages/home";
const Login = lazy(() => import("./pages/login"));
const MyProfile = lazy(() => import("./pages/my-profile"));
const Dashboard = lazy(() => import("./pages/dashboard"));
const Register = lazy(() => import("./pages/register"));
const RequestPasswordReset = lazy(() => import("./pages/RequestPasswordReset"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const SavingsAdmin = lazy(() => import("./pages/SavingsAdmin"));
const WhyUs = lazy(() => import("./pages/why-us"));
const ContactUs = lazy(() => import("./pages/ContactUs"));
const TermsAndConditions = lazy(() => import('./pages/TermsAndConditions'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const LoansAndRepayments = lazy(() => import("./pages/LoansAndRepayments"));
const AIDashboard = lazy(() => import('./pages/AIDashboard'));
const WithdrawalRequest = lazy(() => import('./pages/WithdrawalRequest'));
const Subscribe = lazy(() => import('./pages/Subscribe'));
const MemberPerformance = lazy(() => import('./components/MemberPerformance'));
const UserGuide = lazy(() => import('./pages/UserGuide'));
const SupportChat = lazy(() => import('./components/SupportChat'));


function App() {
  // Auto-logout after 30 minutes of inactivity (increased from 10 to prevent premature logouts)
  useAutoLogout(30);
  
  const [isSupportChatOpen, setIsSupportChatOpen] = useState(false);
  const location = useLocation();
  
  // Don't show support chat on login/register pages
  const showSupportButton = !['/login', '/register'].includes(location.pathname);

  return (
    <>
      <InstallPWA />
      <style>{`
        /* Fix button focus states - only remove outline, don't change colors */
        button:focus,
        button:active,
        input[type="button"]:focus,
        input[type="submit"]:focus,
        input[type="button"]:active,
        input[type="submit"]:active {
          outline: none !important;
        }
        
        /* Animation keyframes */
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <Navbar />
      <Breadcrumbs />
      <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div></div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/my-profile" element={<MyProfile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/register" element={<Register />} />
          <Route path="/request-password-reset" element={<RequestPasswordReset />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin-panel" element={<SavingsAdmin />} />
          <Route path="/why-us" element={<WhyUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/loans" element={<LoansAndRepayments />} /> 
          <Route path="/ai-dashboard" element={<AIDashboard />} />
          <Route path="/performance" element={<MemberPerformance />} />
          <Route path="/user-guide" element={<UserGuide />} />
          <Route path="/withdrawal-request" element={<WithdrawalRequest />} />
          <Route path="/subscribe" element={<Subscribe />} />
          
          {/* Add more routes as needed */}
        </Routes>
      </Suspense>
      
      {/* Floating Support Chat Button */}
      {showSupportButton && (
        <>
          <button
            onClick={() => setIsSupportChatOpen(!isSupportChatOpen)}
            style={{
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              zIndex: 999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#1565c0';
              e.target.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#1976d2';
              e.target.style.transform = 'scale(1)';
            }}
          >
            {isSupportChatOpen ? '×' : '💬'}
          </button>
          
          <SupportChat 
            isOpen={isSupportChatOpen} 
            onClose={() => setIsSupportChatOpen(false)} 
          />
        </>
      )}
      
      <footer style ={{ background: "black", marginTop: 40, padding: "16px 0"}}>
        <div className="max-w-7xl mx-auto">
          {/*responsive flex container
          on small screens, stack vertically, on medium screens align horizintally*/}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-left">
            <div style={{ color: "#1976d2" }}
            className="text-sm font-semibold">
              &copy; 2026 Jaza Nyumba. Secure savings made simple.
          </div>
          <div className="flex justify-centre gap-4 text-sm">
            <a href="/terms" style={{ color: "#1976d2"}}>Terms & Conditions</a>
            <a href="/privacy" style={{ color: "#1976d2"}}>Privacy Policy</a>
            {!localStorage.getItem('token') && (
              <>
                <a href="/login" style={{ color: "#1976d2"}}>Login</a>
                <a href="/register" style={{ color: "#1976d2"}}>Sign Up</a>
              </>
            )}
          </div>
          <div style={{ color: "#1976d2" }} className="text-sm">
            Built with ❤️ by{' '}
            <a href="https://jbestcodes.github.io/Portfolio-website/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#1976d2", textDecoration: "underline" }}
            >Julie</a>
          </div>
        </div>
      </div>
      </footer>
    </>
  );
}

export default App;
