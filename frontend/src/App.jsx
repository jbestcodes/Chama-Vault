import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Navbar from "./Navbar";
import Home from "./pages/home";
import Profile from "./pages/profile";
import Login from "./pages/login";
function App() {
  return (
    <>
  
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
      </Routes>
      </>
  );
}

export default App;
