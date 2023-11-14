import { Container } from "react-bootstrap";
import Sidebar from "./components/sidebar";
import Layout from "./layout/layout";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from "./pages/dashboard";
import Reports from "./pages/reports";
import Files from "./pages/files";
import OutgoingInternal from "./pages/outgoing-internal";
import OutgoingExternal from "./pages/outgoing-external";


function App(){
 return (
  <Router>
    <Layout>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/files" element={<Files />} />
        <Route path="/outgoing-internal" element={<OutgoingInternal />} />
        <Route path="/outgoing-external" element={<OutgoingExternal />} />

      </Routes>
    </Layout>

  </Router>
  
  );
}
 


export default App