import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Navbar from "./Navbar";
import Home from "./pages/home";
import Login from "./pages/login";
import MyProfile from "./pages/my-profile";
import Dashboard from "./pages/dashboard";

function App() {
  return (
    <>
  
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Profile" element={<MyProfile />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      
        {/* Add more routes as needed */}
      </Routes>
      </>
  );
}

export default App;
