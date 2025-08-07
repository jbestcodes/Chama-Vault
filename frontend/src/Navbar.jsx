import {Link } from "react-router-dom";

function Navbar (){
    return (
        <nav>
            <Link to="/">Home</Link>
            <Link to="/profile" className='text-blue-500 hover:underline'>Profile</Link>
            <Link to="/login">Login</Link>
        </nav>
    );
}
export default Navbar;