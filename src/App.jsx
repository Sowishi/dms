import { Container } from "react-bootstrap";
import Sidebar from "./components/sidebar";
import Layout from "./layout/layout";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/dashboard";
import Reports from "./pages/reports";
import Files from "./pages/files";
import OutgoingInternal from "./pages/outgoing-internal";
import OutgoingExternal from "./pages/outgoing-external";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <>
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
        <ToastContainer
          position="top-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </Router>
    </>
  );
}

export default App;
