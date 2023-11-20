import { useState, useEffect } from "react";
import {
  FaBars,
  FaHome,
  FaFile,
  FaFilePdf,
  FaFolder,
  FaUser,
  FaPeopleCarry,
  FaTrash,
} from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const [sidebarShow, setSidebarShow] = useState(true);

  const location = useLocation().pathname;

  return (
    <>
      <div className="flex flex-column relative">
        {!sidebarShow && (
          <FaBars
            style={{ position: "absolute", top: "2px", left: "2px" }}
            onClick={() => setSidebarShow(true)}
            size={"20px"}
            className="mt-3 mx-2"
          />
        )}

        <div className={`sidebar vh-100  ${sidebarShow ? "" : "inactive"}`}>
          <div className="sidebar-header d-flex justify-content-center align-items-center flex-column">
            <div className="brand w-100 flex">
              <img width={"80px"} src="./assets/images/logo.png" alt="" />
            </div>
          </div>
          <div className="sidebar-content mx-3 mt-3">
            <h5 className="fw-bold b-1">Menu</h5>
            <div className="navigation mt-3 d-flex flex-column justify-content-start align-items-start">
              <Link
                className={`flex my-2 nav-link w-100 justify-content-start p-1 py-2 ${
                  location == "/dashboard" ? "active" : ""
                }`}
                to={"/dashboard"}
              >
                <FaHome size={"20px"} />
                <p className="mb-0 mx-2">Dashboard</p>
              </Link>
              <Link
                to={"/files"}
                className={`flex my-2 nav-link w-100 justify-content-start p-1 py-2 ${
                  location == "/files" ? "active" : ""
                }`}
              >
                <FaFile size={"20px"} />
                <p className="mb-0 mx-2">Files</p>
              </Link>
              <Link
                className={`flex my-2 nav-link w-100 justify-content-start p-1 py-2 ${
                  location == "/reports" ? "active" : ""
                }`}
                to={"/reports"}
              >
                <FaFilePdf size={"20px"} />
                <p className="mb-0 mx-2">Reports</p>
              </Link>
              <Link
                to={"/outgoing"}
                className={`flex my-2 nav-link w-100 justify-content-start p-1 py-2 ${
                  location == "/outgoing" ? "active" : ""
                }`}
              >
                <FaFolder size={"20px"} />
                <p className="mb-0 mx-2">Outgoing</p>
              </Link>
              <Link
                to={"/incoming"}
                className={`flex my-2 nav-link w-100 justify-content-start p-1 py-2 ${
                  location == "/incoming" ? "active" : ""
                }`}
              >
                <FaFolder size={"20px"} />
                <p className="mb-0 mx-2">Incoming</p>
              </Link>
            </div>
          </div>

          <div className="sidebar-content mx-3 mt-3">
            <h5 className="fw-bold pb-1">Admin Tools</h5>
            <div className="navigation mt-3 d-flex flex-column justify-content-start align-items-start">
              <Link
                to={"/create-user"}
                className="flex my-2 nav-link w-100 justify-content-start p-1 py-2"
              >
                <FaUser size={"20px"} />
                <p className="mb-0 mx-2">User Management</p>
              </Link>
              <li className="flex my-2 nav-link w-100 justify-content-start p-1 py-2">
                <FaPeopleCarry size={"20px"} />
                <p className="mb-0 mx-2">Office Management</p>
              </li>
              <li className="flex my-2 nav-link w-100 justify-content-start p-1 py-2">
                <FaTrash size={"20px"} />
                <p className="mb-0 mx-2">Recycle BIn</p>
              </li>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
