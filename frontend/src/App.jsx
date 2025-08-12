import { Routes, Route } from "react-router-dom";
import Navbar from "./Navbar";
import Home from "./pages/home";
import Login from "./pages/login";
import MyProfile from "./pages/my-profile";
import Dashboard from "./pages/dashboard";
import Register from "./pages/register";
import RequestPasswordReset from "./pages/RequestPasswordReset";
import ResetPassword from "./pages/ResetPassword";
import SavingsAdmin from "./pages/SavingsAdmin"; 

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
        {/* Add more routes as needed */}
      </Routes>
    </>
  );
}

export default App;
