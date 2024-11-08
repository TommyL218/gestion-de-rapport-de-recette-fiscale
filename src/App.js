import "./App.css";
import NavbarSidebar from './components/Navbar';
import Auth from './components/admin/Connecter';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LayoutWithSidebar from "./components/antd";
import PrevisionByTrimestre from './components/PrevisionByTrimestre';
import LayoutWithSidebarA from "./components/admin/SideBar";
import Error from "./utils/page404";
import PrevisionByTrimestreA from "./components/admin/PrevisionByTriemstreA";

function App() {
  return (
    <Router>
      <Routes>
        
        <Route index element={<Auth/>}/>
        <Route path="/" element={<Auth />} />
        <Route path="/Navbar" element={<NavbarSidebar />} />
        <Route path="/accueil" element={<LayoutWithSidebar />} />
        <Route path="/admin" element={<LayoutWithSidebarA/>} />
        <Route path="/PrevisionByTrimestre" element={<PrevisionByTrimestre />} /> 
        <Route path="/PrevisionByTrimestres" element={<PrevisionByTrimestreA />} />
        <Route path="*" element={<Error/>} />
      
      </Routes>
    </Router>
  );
}

export default App;
