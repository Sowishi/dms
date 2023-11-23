import {
  FaSearch,
  FaFile,
  FaTrash,
  FaEye,
  FaDownload,
  FaMap,
  FaBell,
  FaSuitcase,
  FaIntercom,
  FaInbox,
  FaCaretRight,
  FaFacebookMessenger,
} from "react-icons/fa";
import ListGroup from "react-bootstrap/ListGroup";
import Badge from "react-bootstrap/Badge";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import {
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  deleteDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { auth, db, storage } from "../../firebase";
import BounceLoader from "react-spinners/BounceLoader";
import Dropdown from "react-bootstrap/Dropdown";

import { useEffect, useRef, useState } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { toast } from "react-toastify";
import { createUserWithEmailAndPassword } from "firebase/auth";
import Layout from "../layout/layout";
import ViewModal from "../components/viewModal";
import Offcanvas from "react-bootstrap/Offcanvas";
import PlaceHolder from "../components/placeholder";
import moment from "moment";

const userCollectionRef = collection(db, "users");
const messagesCollectionRef = collection(db, "messages");

function UrgentModal(props) {
  const urgentFiles = props.urgentFiles;
  return (
    <Modal
      {...props}
      size="md"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton className="bg-danger">
        <Modal.Title id="contained-modal-title-vcenter"></Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        <FaBell size={50} color={"gray"} />
        <h3 className="fw-bold">You have an urgent message!</h3>
        <p className="fw-italic">
          The documents below needs your imediate response, please send a
          response before the deadline
        </p>
        {urgentFiles && (
          <Table bordered hover variant="white">
            <thead>
              <tr>
                <th>DocID</th>
                <th>File Name</th>
                <th>Deadline</th>
              </tr>
            </thead>
            <tbody>
              {urgentFiles.map((message) => {
                return (
                  <tr key={message.code}>
                    <td>
                      <div className="flex">
                        <FaFile />
                        {message.code}
                      </div>
                    </td>
                    <td>{message.fileName.substring(0, 20) + ".pdf"}</td>
                    <td>{message.dueDate}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}
function OffCanvasExample(props) {
  const { currentMessage } = props;
  return (
    <>
      <Offcanvas
        placement="end"
        show={props.showRouting}
        onHide={props.handleCloseRouting}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{currentMessage.id}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <h2>Document Routing..</h2>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

const incoming = () => {
  const [modalShow, setModalShow] = useState(false);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentMessage, setCurrentMessage] = useState(null);
  const [showRouting, setShowRouting] = useState(false);
  const [urgent, setUrgent] = useState(false);
  const [urgentFiles, setUrgentFiles] = useState([]);
  const [loading, setLoading] = useState(false);

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

    const handleDelete = () => {
      const docRef = doc(db, "incoming", message.id);
      deleteDoc(docRef).then(() => toast.success("Successfully Deleted!"));
    };

    return (
      <Dropdown>
        <Dropdown.Toggle variant="secondary" id="dropdown-basic">
          <img src="./assets/images/pepicons-pencil_dots-y.png" alt="" />
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <Dropdown.Item
            onClick={() => {
              setModalShow(true);
              setCurrentMessage(message);
            }}
          >
            View Detail <FaEye />
          </Dropdown.Item>
          <Dropdown.Item onClick={downloadFIle}>
            Download <FaDownload />
          </Dropdown.Item>

          <Dropdown.Item
            onClick={() => {
              setCurrentMessage(message);
              setShowRouting(true);
            }}
          >
            View Routing <FaMap />
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    );
  }

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
        const urgents = [];
        querySnapshot.forEach((doc) => {
          const message = { ...doc.data(), id: doc.id };
          if (
            message.reciever == auth.currentUser.uid ||
            message.reciever == message.sender
          ) {
            if (message.reciever !== auth.currentUser.uid) {
              message.push(message);
              if (
                message.prioritization == "urgent" &&
                message.status == "Pending"
              ) {
                urgents.push(message);
              }
            }
          }
        });
        if (urgents.length >= 1) {
          setUrgent(true);
        }
        setUrgentFiles(urgents);
        setMessages(messages);
      },
      (error) => {
        console.error("Error listening to collection:", error);
      }
    );

    setLoading(false);
  };

  const getUser = (id) => {
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

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Layout>
      {currentMessage && (
        <OffCanvasExample
          currentMessage={currentMessage}
          showRouting={showRouting}
          handleCloseRouting={() => setShowRouting(false)}
          placement={"end"}
          name={"end"}
        />
      )}

      {currentMessage && (
        <ViewModal
          getUser={getUser}
          currentMessage={currentMessage}
          closeModal={() => setModalShow(false)}
          showModal={modalShow}
        />
      )}

      {messages && (
        <UrgentModal
          show={urgent}
          onHide={() => setUrgent(false)}
          urgentFiles={urgentFiles}
        />
      )}

      <div className="dashboard">
        <div className="dashboard-header ">
          <div className="row">
            <div className="col-lg-6 flex"></div>
          </div>
        </div>
        <div className="dashboard-content mx-3 mt-3">
          <div className="wrapper">
            <h2 className="fw-bold my-3 mx-2">
              Incoming Messages
              <FaFacebookMessenger className="mx-2" />
            </h2>
            <div
              className="bg-info mx-2 mb-3"
              style={{ width: "200px", height: "10px", borderRadius: 20 }}
            ></div>
          </div>
          <div className="row">
            <div className="col-lg-7">
              <ListGroup horizontal>
                <ListGroup.Item>
                  All <Badge bg="info">9</Badge>
                </ListGroup.Item>
                <ListGroup.Item>
                  Current <Badge bg="info">9</Badge>
                </ListGroup.Item>
                <ListGroup.Item>
                  Usual <Badge bg="info">9</Badge>
                </ListGroup.Item>
              </ListGroup>
            </div>
            <div className="col-lg-5">
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

          <Table responsive="md" bordered hover variant="white">
            <thead>
              <tr>
                <th>DocID</th>
                <th>File Name</th>
                <th>Sender</th>
                <th>Required Action</th>
                <th>Date </th>
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
                      {getUser(message.sender).fullName} -
                      <b> {getUser(message.sender).position}</b>
                    </td>
                    <td>{message.action}</td>
                    <td>{moment(message.date.toDate()).format("LL")}</td>
                    <td className="flex">
                      {" "}
                      <Badge
                        bg={
                          message.prioritization == "urgent" ? "danger" : "info"
                        }
                        className="text-white p-2"
                      >
                        {toTitleCase(message.prioritization)}
                      </Badge>{" "}
                    </td>
                    <td>
                      <Badge
                        bg={message.status == "Approved" ? "primary" : "danger"}
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
        </div>
      </div>
    </Layout>
  );
};

export default incoming;
