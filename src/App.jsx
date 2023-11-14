import { Container } from "react-bootstrap";
import Sidebar from "./components/sidebar";
import Layout from "./layout/layout";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from "./pages/dashboard";
import Reports from "./pages/reports";


function App(){
 return (
  <Router>
    <Layout>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </Layout>

  </Router>
  
  );
}
 


export default App