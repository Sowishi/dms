import Sidebar from "../components/sidebar";
import { FaUserCircle} from "react-icons/fa";


const Layout = ({children}) => {
    return (

        <div className="container-fluid d-flex p-0">
            <Sidebar/>
            <div className="main w-100">
                <div className="main-header bg-primary py-2 w-100 d-flex justify-content-end align-items-center">
                    <div className="wrapper mx-3 flex">
                        <FaUserCircle size={"20px"}/>
                        <p className="mb-0 mx-2">Administrator</p>
                    </div>
                </div>
                <div className="main-content">
                    {children}
                </div>
            </div>
        </div>

      );
}
 
export default Layout;