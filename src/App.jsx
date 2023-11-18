import { Container, Spinner } from "react-bootstrap";
import Sidebar from "./components/sidebar";
import Layout from "./layout/layout";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  Link,
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
import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "../firebase";
import { FaUser, FaLock } from "react-icons/fa";
import { BounceLoader } from "react-spinners";
import { doc, getDoc } from "firebase/firestore";
import UserDashboard from "./pages/user-dashboard";
import UserIncoming from "./pages/user-incoming";

function App() {
  const [user, setUser] = useState(null);
  const [appLoading, setAppLoading] = useState(false);
  const [admin, setAdmin] = useState(false);

  const LoginComponent = () => {
    let navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const isAdmin = async () => {
      const userRef = doc(db, "users", auth.currentUser.uid);
      const docSnapshot = await getDoc(userRef);
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        if (data.role == "admin") {
          setAdmin(true);
          navigate("/dashboard");
        }
        if (data.role == "user") {
          navigate("/user-dashboard");
        }
      }
    };

    const handleLogin = async () => {
      setLoading(true);
      try {
        await signInWithEmailAndPassword(auth, email, password);
        isAdmin();
      } catch (error) {
        toast.error(error.message);
      }
      setLoading(false);
    };

    return (
      <>
        <div className="login-wrapper d-flex justify-content-center align-items-center">
          <div className="login-content d-flex justify-content-center align-items-center flex-column">
            <img width={"80px"} src="./assets/images/logo.png" alt="" />
            <h2 className="fw-bold">DMS-LGU</h2>
            <p>Document Management System</p>
            <div className="wrapper flex ">
              <FaUser className="m-3" />
              <input
                className="form-control bg-secondary"
                type="text"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="wrapper flex">
              <FaLock className="m-3" />
              <input
                className="form-control bg-secondary"
                type="password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button className="btn btn-primary my-3 px-5" onClick={handleLogin}>
              {!loading ? (
                "Login"
              ) : (
                <Spinner animation="border" variant="secondary" />
              )}
            </button>
            <Link to={"/forgot"}>Forgot Password?</Link>
          </div>
        </div>
      </>
    );
  };

  const ForgotComponent = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleForgot = async () => {
      try {
        setLoading(true);
        await sendPasswordResetEmail(auth, email);
        toast.success("Successfully sent an email for password reset");
      } catch (error) {
        toast.error(error.message);
      }
      setLoading(false);
    };

    return (
      <>
        <div className="login-wrapper d-flex justify-content-center align-items-center">
          <div className="login-content d-flex justify-content-center align-items-center flex-column">
            <img width={"80px"} src="./assets/images/logo.png" alt="" />
            <h2 className="fw-bold">DMS-LGU</h2>
            <p>Document Management System</p>
            <div className="wrapper flex ">
              <FaUser className="m-3" />
              <input
                className="form-control bg-secondary"
                type="text"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              className="btn btn-primary my-3 px-5"
              onClick={handleForgot}
            >
              {!loading ? (
                "Send Email"
              ) : (
                <Spinner animation="border" variant="secondary" />
              )}
            </button>
          </div>
        </div>
      </>
    );
  };

  useEffect(() => {
    setAppLoading(true);

    onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
    });

    setTimeout(() => {
      setAppLoading(false);
    }, 2000);
  }, []);

  return (
    <>
      {!appLoading ? (
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
                <Route path="/user-dashboard" element={<UserDashboard />} />
                <Route path="/user-incoming" element={<UserIncoming />} />
              </Routes>
            ) : (
              <Routes>
                <Route path="/" element={<LoginComponent />} />
                <Route path="/forgot" element={<ForgotComponent />} />
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
      ) : (
        <div className="vh-100 flex">
          <BounceLoader size={100} color="#5cd000" />
        </div>
      )}
    </>
  );
}

export default App;
