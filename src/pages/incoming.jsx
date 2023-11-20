import {
  FaSearch,
  FaFile,
  FaTrash,
  FaEye,
  FaDownload,
  FaMap,
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

const userCollectionRef = collection(db, "users");
const outgoingCollectionRef = collection(db, "incoming");

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
  const [allSender, setAllSender] = useState([]);
  const [allReciever, setAllReciever] = useState([]);
  const [outgoingMesssages, setOutgoingMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState(null);
  const [showRouting, setShowRouting] = useState(false);

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
          <Dropdown.Item onClick={handleDelete}>
            Delete <FaTrash />
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
    const snapshot = await getDocs(userCollectionRef);
    const output = snapshot.docs.map((doc) => {
      return { id: doc.id, ...doc.data() };
    });
    const sender = output.filter((user) => {
      if (user.role == "user") {
        return user;
      }
    });
    const reciever = output.filter((user) => {
      if (user.role == "admin") {
        return user;
      }
    });

    onSnapshot(
      outgoingCollectionRef,
      (querySnapshot) => {
        const messages = [];
        querySnapshot.forEach((doc) => {
          const message = { ...doc.data(), id: doc.id };
          if (message.reciever == auth.currentUser.uid) {
            messages.push(message);
          }
        });
        setOutgoingMessages(messages);
      },
      (error) => {
        console.error("Error listening to collection:", error);
      }
    );

    setAllSender(sender);
    setAllReciever(reciever);
  };

  const getUser = (id) => {
    const user = allSender.filter((user) => {
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

      <div className="dashboard">
        <div className="dashboard-header ">
          <div className="row">
            <div className="col-lg-6 flex">
              <img src="./assets/images/Group 8829.png" alt="" />
            </div>
          </div>
        </div>
        <div className="dashboard-content mx-3 mt-3">
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
          <Table bordered hover variant="white">
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
              {outgoingMesssages.map((message) => {
                return (
                  <tr key={message.code}>
                    <td>
                      <div className="flex">
                        <FaFile />
                        {message.code}
                      </div>
                    </td>
                    <td>{message.fileName}</td>

                    <td>{getUser(message.sender).fullName}</td>
                    <td>{message.action}</td>
                    <td>{message.date}</td>
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
