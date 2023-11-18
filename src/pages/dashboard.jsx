import { FaSearch, FaFile } from "react-icons/fa";
import ListGroup from "react-bootstrap/ListGroup";
import Badge from "react-bootstrap/Badge";
import Table from "react-bootstrap/Table";
import Layout from "../layout/layout";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";

function MyVerticallyCenteredModal(props) {
  return (
    <Modal
      {...props}
      size="md"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton className="bg-primary">
        <Modal.Title id="contained-modal-title-vcenter"></Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        <img src="./assets/images/game-icons_confirmed.png" alt="" />

        <h2 className="fw-bold">Welcome Back!</h2>
        <h5>Hello, {props.user.fullName}</h5>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}

const Dashboard = () => {
  const [modalShow, setModalShow] = useState(false);
  const [user, setUser] = useState(null);

  const getUser = async () => {
    const userRef = doc(db, "users", auth.currentUser.uid);
    const snapshot = await getDoc(userRef);
    setUser(snapshot.data());
  };

  useEffect(() => {
    setModalShow(true);
    getUser();
  }, []);

  console.log(user);

  return (
    <Layout>
      <div className="dashboard">
        {user && (
          <MyVerticallyCenteredModal
            show={modalShow}
            onHide={() => setModalShow(false)}
            user={user}
          />
        )}

        <div className="dashboard-header ">
          <div className="row">
            <div className="col-lg-6">
              <div className="stats flex">
                <div className="wrapper flex mx-3">
                  <img src="./assets/images/ri_home-office-line.png" alt="" />
                  <div className="wrapper flex flex-column">
                    <p className="mb-0">Offices</p>
                    <Badge bg="primary">9</Badge>
                  </div>
                </div>
                <div className="wrapper flex mx-3">
                  <img
                    src="./assets/images/heroicons_users-20-solid.png"
                    alt=""
                  />
                  <div className="wrapper flex flex-column">
                    <p className="mb-0">Members</p>
                    <Badge bg="primary">9</Badge>
                  </div>
                </div>
                <div className="wrapper flex mx-3">
                  <img src="./assets/images/solar_documents-bold.png" alt="" />
                  <div className="wrapper flex flex-column">
                    <p className="mb-0">Documents</p>
                    <Badge bg="primary">9</Badge>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="search flex w-100 ">
                <input
                  type="text"
                  placeholder="Search docID, name, etc..."
                  className="form form-control w-75 bg-secondary mx-2"
                />
                <FaSearch />
              </div>
            </div>
          </div>
        </div>
        <div className="dashboard-content mx-3 mt-3">
          <h4 className="my-3">Compliances & Completed Documents</h4>
          <ListGroup horizontal>
            <ListGroup.Item>
              All <Badge bg="info">9</Badge>
            </ListGroup.Item>
            <ListGroup.Item>
              Pending <Badge bg="info">9</Badge>
            </ListGroup.Item>
            <ListGroup.Item>
              Recieved <Badge bg="info">9</Badge>
            </ListGroup.Item>
            <ListGroup.Item>Approve</ListGroup.Item>
            <ListGroup.Item>Rejected</ListGroup.Item>
          </ListGroup>
          <Table bordered hover variant="primary">
            <thead>
              <tr>
                <th>DocID</th>
                <th>File Name</th>
                <th>From</th>
                <th>Required Action</th>
                <th>Date Received</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="flex">
                  <FaFile />
                  00001
                </td>
                <td>test.pdf</td>
                <td>Ms.Personnel - Office, Position</td>
                <td>For Submission</td>
                <td>Oct. 27, 2023</td>
                <td>
                  <Badge bg="warning" className="text-black">
                    Pending
                  </Badge>
                </td>
                <td className="flex">
                  <img
                    src="./assets/images/pepicons-pencil_dots-y.png"
                    alt=""
                  />
                </td>
              </tr>
              <tr>
                <td className="flex">
                  <FaFile />
                  00001
                </td>
                <td>test.pdf</td>
                <td>Ms.Personnel - Office, Position</td>
                <td>For Submission</td>
                <td>Oct. 27, 2023</td>
                <td>
                  <Badge bg="warning" className="text-black">
                    Pending
                  </Badge>
                </td>
                <td className="flex">
                  <img
                    src="./assets/images/pepicons-pencil_dots-y.png"
                    alt=""
                  />
                </td>
              </tr>
              <tr>
                <td className="flex">
                  <FaFile />
                  00001
                </td>
                <td>test.pdf</td>
                <td>Ms.Personnel - Office, Position</td>
                <td>For Submission</td>
                <td>Oct. 27, 2023</td>
                <td>
                  <Badge bg="warning" className="text-black">
                    Pending
                  </Badge>
                </td>
                <td className="flex">
                  <img
                    src="./assets/images/pepicons-pencil_dots-y.png"
                    alt=""
                  />
                </td>
              </tr>
            </tbody>
          </Table>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
