import Sidebar from "../components/sidebar";
import { FaUserCircle } from "react-icons/fa";
import Breadcrumb from "react-bootstrap/Breadcrumb";
import Dropdown from "react-bootstrap/Dropdown";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate } from "react-router";
import UserSidebar from "../components/userSidebar";

const LayoutUser = ({ children }) => {
  const navigation = useNavigate();

  const handleLogout = () => {
    signOut(auth);
    navigation("/");
  };

  return (
    <div className="container-fluid d-flex p-0">
      <UserSidebar />
      <div className="main w-100">
        <div className="main-header bg-primary py-2 w-100 d-flex justify-content-end align-items-center">
          <div className="wrapper mx-3 flex">
            <FaUserCircle size={"20px"} />
            <p className="mb-0 mx-2">User</p>
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
        <Breadcrumb className="m-3">
          <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
          <Breadcrumb.Item href="#">Library</Breadcrumb.Item>
          <Breadcrumb.Item active>Data</Breadcrumb.Item>
        </Breadcrumb>
        <div className="main-content">{children}</div>
      </div>
    </div>
  );
};

export default LayoutUser;
