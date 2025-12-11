import { Routes, Route } from "react-router-dom";
import Navbar from './Navbar';
import Home from "./pages/home";
import Login from "./pages/login";
import MyProfile from "./pages/my-profile";
import Dashboard from "./pages/dashboard";
import Register from "./pages/register";
import RequestPasswordReset from "./pages/RequestPasswordReset";
import ResetPassword from "./pages/ResetPassword";
import SavingsAdmin from "./pages/SavingsAdmin"; 
import WhyUs from "./pages/why-us";
import ContactUs from "./pages/ContactUs";
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import LoansAndRepayments from "./pages/LoansAndRepayments"; 
import AIDashboard from './pages/AIDashboard';
import WithdrawalRequest from './pages/WithdrawalRequest';
import Subscribe from './pages/Subscribe';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
  return (
    <>
      <Navbar />
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
        <Route path="/withdrawal-request" element={<WithdrawalRequest />} />
        <Route path="/subscribe" element={<Subscribe />} />
        
        {/* Add more routes as needed */}
      </Routes>
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
