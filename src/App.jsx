import { Container } from "react-bootstrap";
import Sidebar from "./components/sidebar";
import Layout from "./layout/layout";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import Dashboard from "./pages/dashboard";
import Reports from "./pages/reports";
import Files from "./pages/files";
import Outgoing from "./pages/outgoing";
import Incoming from "./pages/incoming";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import OutgoingView from "./pages/outgoing-view";
import CreateUser from "./pages/createUser";
import LayoutUser from "./layout/layoutUser";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import BounceLoader from "react-spinners/BounceLoader";

function App() {
  const [user, setUser] = useState(null);

  const LoginComponent = () => {
    let navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        navigate("/dashboard");
      } catch (error) {
        toast.error(error.message);
      }
    };

    return (
      <>
        <div className="login-wrapper">
          <input type="text" onChange={(e) => setEmail(e.target.value)} />
          <input
            type="password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleLogin}>LoginComponent</button>
        </div>
      </>
    );
  };

  useEffect(() => {
    onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
    });
  }, []);

  console.log(user);

  return (
    <>
      <Router>
        <>
          {user ? (
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/files" element={<Files />} />
              <Route path="/outgoing" element={<Outgoing />} />
              <Route path="/outgoing/:docID" element={<OutgoingView />} />
              <Route path="/incoming" element={<Incoming />} />
              <Route path="/create-user" element={<CreateUser />} />{" "}
            </Routes>
          ) : (
            <Routes>
              <Route path="/" element={<LoginComponent />} />
            </Routes>
          )}
        </>

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
