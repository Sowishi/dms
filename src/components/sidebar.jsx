
import { FaBars, FaHome, FaFile, FaFilePdf, FaFolder, FaUser, FaPeopleCarry, FaTrash} from "react-icons/fa";
import { Link } from 'react-router-dom';

const Sidebar = () => {
    return ( 
        <>  
            <div className="sidebar vh-100 shadow">
                <div className="sidebar-header d-flex justify-content-center align-items-center flex-column">
                    <FaBars size={"20px"} className="align-self-end m-2"/>
                    <div className="brand w-100 flex">
                    <img width={"80px"} src="./assets/images/logo.png" alt="" />

                    </div>
                </div>
                <div className="sidebar-content mx-2 mt-3">
                    <h5 className="border-bottom border-black pb-1">Menu</h5>
                    <div className="navigation mt-3 d-flex flex-column justify-content-start align-items-start">
                        <Link className="flex my-2 nav-link" to={"/dashboard"}>
                            <FaHome size={"20px"}/>
                            <p className="mb-0 mx-2">Dashboard</p>
                        </Link> 
                         <Link to={"/files"} className="flex my-2 nav-link">
                            <FaFile size={"20px"}/>
                            <p className="mb-0 mx-2">Files</p>
                        </Link>
                        <Link className="flex my-2 nav-link" to={"/reports"}>
                            <FaFilePdf size={"20px"}/>
                            <p className="mb-0 mx-2">Reports</p>
                        </Link>
                        <Link to={"/outgoing-internal"} className="flex my-2 nav-link">
                            <FaFolder size={"20px"}/>
                            <p className="mb-0 mx-2">Outgoing Internal</p>
                        </Link>
                        <Link to={"/outgoing-external"} className="flex my-2 nav-link">
                            <FaFolder size={"20px"}/>
                            <p className="mb-0 mx-2">Outgoing External</p>
                        </Link>
                    </div>
                </div>

                 <div className="sidebar-content mx-2 mt-3">
                    <h5 className="border-bottom border-black pb-1">Admin Tools</h5>
                    <div className="navigation mt-3 d-flex flex-column justify-content-start align-items-start">
                        <li className="flex my-2">
                            <FaUser size={"20px"}/>
                            <p className="mb-0 mx-2">User Management</p>
                        </li>
                         <li className="flex my-2">
                            <FaPeopleCarry size={"20px"}/>
                            <p className="mb-0 mx-2">Office Management</p>
                        </li>
                         <li className="flex my-2">
                            <FaTrash size={"20px"}/>
                            <p className="mb-0 mx-2">Recycle BIn</p>
                        </li>
                         
                    </div>
                </div>
            </div>

        </>
     );
}
 
export default Sidebar;