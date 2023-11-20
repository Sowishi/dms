import Sidebar from "../components/sidebar";
import { FaBaby, FaBars, FaUserCircle } from "react-icons/fa";
import Breadcrumb from "react-bootstrap/Breadcrumb";
import Dropdown from "react-bootstrap/Dropdown";
import { signOut } from "firebase/auth";
import { auth, db } from "../../firebase";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";

import Button from "react-bootstrap/Button";
import Offcanvas from "react-bootstrap/Offcanvas";

function SidebarWrapper(props) {
  return (
    <>
      <Offcanvas show={props.show} onHide={props.handleClose}>
        <Offcanvas.Body>
          <Sidebar />
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

const Layout = ({ children }) => {
  const [user, setUser] = useState(null);
  const [show, setShow] = useState(false);

  const getUser = async () => {
    const userRef = doc(db, "users", auth.currentUser.uid);
    const snapshot = await getDoc(userRef);
    setUser(snapshot.data());
  };
  const navigation = useNavigate();

  const handleLogout = () => {
    signOut(auth);
    navigation("/");
  };

  useEffect(() => {
    getUser();
  }, []);

  return (
    <div className="container-fluid p-0">
      {/* <Sidebar /> */}
      <SidebarWrapper show={show} handleClose={() => setShow(false)} />
      <div className="main w-100">
        <div className="main-header bg-primary py-2 w-100 d-flex justify-content-between align-items-center">
          <div className="flex mx-3">
            <img
              style={{ cursor: "pointer" }}
              onClick={() => setShow(true)}
              src="./assets/images/Vector.png"
              alt=""
            />
          </div>
          <div className="wrapper mx-3 flex">
            <FaUserCircle size={"20px"} />
            {user && (
              <p className="mb-0 mx-2">
                {" "}
                {user.fullName} - <b>Administrator</b>
              </p>
            )}{" "}
            <Dropdown>
              <Dropdown.Toggle
                variant="success"
                id="dropdown-basic"
              ></Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item>Profile</Dropdown.Item>
                <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>

        <div className="main-content my-4 px-3">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
