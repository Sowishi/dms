import { useState } from "react";
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

const UserSidebar = () => {
  const location = useLocation().pathname;

  return (
    <>
      <div className="sidebar vh-100 shadow">
        <div className="sidebar-header d-flex justify-content-center align-items-center flex-column">
          <FaBars size={"20px"} className="align-self-end m-2" />
          <div className="brand w-100 flex">
            <img width={"80px"} src="./assets/images/logo.png" alt="" />
          </div>
        </div>
        <div className="sidebar-content mx-3 mt-3">
          <div className="navigation mt-3 d-flex flex-column justify-content-start align-items-start">
            <Link
              to={"/user-files"}
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
              to={"/user-reports"}
            >
              <FaFilePdf size={"20px"} />
              <p className="mb-0 mx-2">Reports</p>
            </Link>
            <Link
              to={"/user-outgoing"}
              className={`flex my-2 nav-link w-100 justify-content-start p-1 py-2 ${
                location == "/outgoing" ? "active" : ""
              }`}
            >
              <FaFolder size={"20px"} />
              <p className="mb-0 mx-2">Outgoing</p>
            </Link>
            <Link
              to={"/user-incoming"}
              className={`flex my-2 nav-link w-100 justify-content-start p-1 py-2 ${
                location == "/incoming" ? "active" : ""
              }`}
            >
              <FaFolder size={"20px"} />
              <p className="mb-0 mx-2">Incoming</p>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserSidebar;
