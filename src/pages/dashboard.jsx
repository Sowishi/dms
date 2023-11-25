import {
  FaSearch,
  FaFile,
  FaTrash,
  FaEye,
  FaDownload,
  FaMap,
  FaFileArchive,
} from "react-icons/fa";
import ListGroup from "react-bootstrap/ListGroup";
import Badge from "react-bootstrap/Badge";
import Table from "react-bootstrap/Table";
import Layout from "../layout/layout";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { auth, db } from "../../firebase";
import { Dropdown } from "react-bootstrap";
import ViewModal from "../components/viewModal";
import { toast } from "react-toastify";
import Placeholder from "react-bootstrap/Placeholder";
import PlaceHolder from "../components/placeholder";
import moment from "moment";

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
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [showViewModal, setShowViewModal] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const messagesCollectionRef = collection(db, "messages");
  const userCollectionRef = collection(db, "users");

  function DropdownAction({ message }) {
    const downloadFIle = () => {
      const fileUrl = message.fileUrl;
      const link = document.createElement("a");
      link.href = fileUrl;
      link.target = "_blank";
      link.download = "downloaded_file";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    const handleDelete = async () => {
      const docMessage = doc(db, "messages", message.id);
      deleteDoc(docMessage).then(() => toast.success("Successfully Deleted!"));
    };

    return (
      <Dropdown>
        <Dropdown.Toggle variant="secondary" id="dropdown-basic">
          <img src="./assets/images/pepicons-pencil_dots-y.png" alt="" />
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <Dropdown.Item
            onClick={() => {
              setShowViewModal(true);
              setCurrentMessage(message);
            }}
          >
            View Detail <FaEye />
          </Dropdown.Item>
          <Dropdown.Item onClick={downloadFIle}>
            Download <FaDownload />
          </Dropdown.Item>
          <Dropdown.Item onClick={handleDelete}>
            Delete <FaTrash />
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    );
  }

  const getUser = async () => {
    const userRef = doc(db, "users", auth.currentUser.uid);
    const snapshot = await getDoc(userRef);
    setUser(snapshot.data());
  };

  const fetchData = async () => {
    setLoading(true);
    const snapshot = await getDocs(userCollectionRef);
    const output = snapshot.docs.map((doc) => {
      return { id: doc.id, ...doc.data() };
    });

    setUsers(output);

    onSnapshot(
      messagesCollectionRef,
      (querySnapshot) => {
        const messages = [];
        querySnapshot.forEach((doc) => {
          messages.push({ ...doc.data(), id: doc.id });
        });
        setMessages(messages);
      },
      (error) => {
        console.error("Error listening to collection:", error);
      }
    );

    setLoading(false);
  };

  const getUserData = (id) => {
    const user = users.filter((user) => {
      if (user.id === id) {
        return user;
      }
    });

    return user[0];
  };

  function toTitleCase(str) {
    return str.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

  const allApprove = () => {
    const output = messages.filter((message) => {
      if (message.status == "Approved") {
        return message;
      }
    });

    return output.length;
  };

  const allRejected = () => {
    const output = messages.filter((message) => {
      if (message.status == "Rejected") {
        return message;
      }
    });
    return output.length;
  };

  useEffect(() => {
    setModalShow(true);
    getUser();
    fetchData();
  }, []);

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

        {currentMessage && (
          <ViewModal
            getUser={getUserData}
            outgoing={true}
            dashboard={true}
            currentMessage={currentMessage}
            closeModal={() => setShowViewModal(false)}
            showModal={showViewModal}
          />
        )}

        <div className="dashboard-header ">
          <div className="row">
            <div className="col-lg-12 my-3 my-lg-0">
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
                    <Badge bg="primary">{users.length}</Badge>
                  </div>
                </div>
                <div className="wrapper flex mx-3">
                  <img src="./assets/images/solar_documents-bold.png" alt="" />
                  <div className="wrapper flex flex-column">
                    <p className="mb-0">Documents</p>

                    {messages && <Badge bg="primary">{messages.length}</Badge>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="dashboard-content mx-3 mt-3">
          <div className="wrapper">
            <h2 className="fw-bold my-3 mx-2">
              Dashboard Overview <FaFile className="mx-2" />
            </h2>
            <div
              className="bg-info mx-2 mb-3"
              style={{ width: "200px", height: "10px", borderRadius: 20 }}
            ></div>
          </div>

          <div className="row">
            <div className="col-lg-6 d-flex my-2 my-lg-0">
              <ListGroup horizontal>
                <ListGroup.Item>
                  All <Badge bg="primary">{messages.length}</Badge>
                </ListGroup.Item>
                <ListGroup.Item>
                  Approved <Badge bg="primary">{allApprove()}</Badge>
                </ListGroup.Item>
                <ListGroup.Item>
                  Rejected <Badge bg="danger">{allRejected()}</Badge>{" "}
                </ListGroup.Item>
              </ListGroup>
            </div>
            <div className="col-lg-6 flex my-2 my-lg-0">
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

          {loading && <PlaceHolder />}

          {messages && (
            <Table responsive="md" bordered variant="white">
              <thead>
                <tr>
                  <th>DocID</th>
                  <th>File Name</th>
                  <th>Sender</th>
                  <th>Reciever</th>
                  <th>Date </th>
                  <th>Subject</th>
                  <th>Prioritization</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((message) => {
                  return (
                    <tr key={message.code}>
                      <td>
                        <div className="flex">
                          <FaFile />
                          {message.code}
                        </div>
                      </td>
                      <td>{message.fileName}</td>
                      <td>
                        {getUserData(message.sender).fullName} -{" "}
                        <b> {getUserData(message.sender).position}</b>
                      </td>
                      <td>
                        {message.reciever == message.sender ? (
                          "Send to all"
                        ) : (
                          <>
                            {getUserData(message.reciever).fullName} -{" "}
                            <b> {getUserData(message.reciever).position}</b>
                          </>
                        )}
                      </td>
                      {message.date.toDate && (
                        <td>{moment(message.date.toDate()).format("LL")}</td>
                      )}{" "}
                      <td>{message.subject}</td>
                      <td className="flex">
                        {" "}
                        <Badge
                          bg={
                            message.prioritization == "urgent"
                              ? "danger"
                              : "info"
                          }
                          className="text-white p-2"
                        >
                          {toTitleCase(message.prioritization)}
                        </Badge>{" "}
                      </td>
                      <td>
                        <Badge
                          bg={
                            message.status == "Approved" ? "primary" : "danger"
                          }
                          className="text-white p-2"
                        >
                          {message.status}
                        </Badge>
                      </td>
                      <td className="flex">
                        <DropdownAction message={message} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
