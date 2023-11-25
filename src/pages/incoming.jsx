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
  FaCheck,
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
  serverTimestamp,
  query,
  orderBy,
  setDoc,
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
const incomingExternalRef = collection(db, "incoming-external");

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
          <Table bordered variant="white">
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
function Routing(props) {
  const { currentMessage } = props;
  const [routing, setRouting] = useState();

  const getRouting = (currentMessage) => {
    const q = query(
      collection(db, "routing", currentMessage.id, currentMessage.id),
      orderBy("createdAt", "asc")
    );
    onSnapshot(q, (snapshot) => {
      const output = [];
      snapshot.docs.forEach((doc) => {
        output.push({ ...doc.data(), id: doc.id });
      });
      setRouting(output);
    });
  };

  useEffect(() => {
    getRouting(currentMessage);
  }, [currentMessage]);

  return (
    <>
      <Offcanvas
        placement="end"
        show={props.showRouting}
        onHide={props.handleCloseRouting}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Document Routing</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {routing &&
            routing.map((route) => {
              return (
                <div className="div">
                  <div className="row">
                    {route.createdAt && (
                      <div className="col-5 py-4 d-flex justify-content-start alig-items-start">
                        {moment(route.createdAt.toDate()).format("LLL")}
                      </div>
                    )}

                    <div className="col-2 flex flex-column">
                      <div
                        className="div "
                        style={{
                          height: "100%",
                          width: "5px",
                          background: "gray",
                        }}
                      ></div>
                      {route.status == "Recieved" && (
                        <FaFile size={30} className="my-1" />
                      )}
                      {route.status == "Seen" && (
                        <FaEye size={30} className="my-1" />
                      )}
                      {route.status == "Created" && (
                        <FaCheck size={30} className="my-1" />
                      )}
                    </div>
                    <div className="col-5 py-4 flex">
                      <h5>{route.status}</h5>
                    </div>
                  </div>
                </div>
              );
            })}
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

const incoming = () => {
  const [modalShow, setModalShow] = useState(false);
  const [messages, setMessages] = useState([]);
  const [externalMessages, setExternalMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentMessage, setCurrentMessage] = useState(null);
  const [showRouting, setShowRouting] = useState(false);
  const [urgent, setUrgent] = useState(false);
  const [urgentFiles, setUrgentFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState("internal");
  const [composeModalOpen, setComposeModalOpen] = useState(false);

  function ComposeModal(props) {
    const [code, setCode] = useState("");
    const [sender, setSender] = useState("");
    const [reciever, setReciever] = useState(props.currentUser.uid);
    const [subject, setSubject] = useState("");
    const [description, setDescription] = useState("");
    const [prioritization, setPrioritization] = useState("");
    const [classification, setClassification] = useState("");
    const [subClassification, setSubClassification] = useState("");
    const [action, setAction] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [deliverType, setDeliverType] = useState("");
    const [documentFlow, setDocumentFlow] = useState("");
    const [attachmentDetail, setAttachmentDetail] = useState("");
    const [file, setFile] = useState("");
    const [loading, setLoading] = useState(false);

    const generateRandomCode = () => {
      const min = 1000;
      const max = 99999;
      const code = Math.floor(Math.random() * (max - min + 1)) + min;
      setCode(code.toString());
    };

    const validateForm = () => {
      // console.log("Code:", code);
      // console.log("Sender:", sender);
      // console.log("Receiver:", reciever);
      // console.log("Subject:", subject);
      // console.log("Description:", description);
      // console.log("Prioritization:", prioritization);
      // console.log("Classification:", classification);
      // console.log("Subclassification:", subClassification);
      // console.log("Action:", action);
      // console.log("Due Date:", dueDate);
      // console.log("Deliver Type:", deliverType);
      // console.log("Document Flow:", documentFlow);
      // console.log("Attachment Detail:", attachmentDetail);
      // console.log("File:", file);
      if (
        code &&
        sender &&
        reciever &&
        subject &&
        description &&
        prioritization &&
        classification &&
        subClassification &&
        action &&
        deliverType &&
        documentFlow &&
        attachmentDetail &&
        file
      ) {
        return true;
      } else {
        return false;
      }
    };

    function ConfirmationModal() {
      const [show, setShow] = useState(false);

      const handleClose = () => setShow(false);

      return (
        <>
          <Button
            variant="primary"
            onClick={() => {
              if (validateForm()) {
                setShow(true);
              } else {
                toast.error("Pleae fill up the form completely");
              }
            }}
          >
            Send Message
          </Button>

          <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>Confirmation</Modal.Title>
            </Modal.Header>
            <Modal.Body className="flex flex-column">
              <img src="./assets/images/game-icons_confirmed.png" alt="" />
              Proceed to send document?
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleUpload}>
                Confirm
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      );
    }

    const handleSubmit = (fileUrl) => {
      try {
        const dataObject = {
          code: code || null,
          sender: sender || null,
          reciever: props.currentUser.uid || null,
          subject: subject || null,
          description: description || null,
          prioritization: prioritization || null,
          date: serverTimestamp(),
          classification: classification || null,
          subClassification: subClassification || null,
          action: action || null,
          dueDate: dueDate || null,
          deliverType: deliverType || null,
          documentFlow: documentFlow || null,
          attachmentDetail: attachmentDetail || null,
          fileUrl: fileUrl || null,
          fileName: file.name,
          status: "Recieved",
          createdAt: serverTimestamp(),
          isSendToALl: props.currentUser.uid === reciever,
        };
        addDoc(incomingExternalRef, dataObject).then(() => {
          setComposeModalOpen(false);
          toast.success("Your message is succesfully sent!");
        });
      } catch (error) {
        toast.error(error.message);
      }
    };

    const handleUpload = async () => {
      setLoading(true);
      if (file) {
        const storageRef = ref(storage, `uploads/${file.name}`);
        uploadBytes(storageRef, file).then((snapshot) => {
          getDownloadURL(storageRef)
            .then((url) => {
              if (url) {
                handleSubmit(url);
              }
            })
            .catch((error) => {
              console.error("Error getting download URL:", error);
            });
        });
      } else {
        console.warn("No file selected for upload");
      }
    };

    return (
      <Modal
        {...props}
        size="xl"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">Compose</Modal.Title>
        </Modal.Header>
        {loading ? (
          <div className="flex flex-column my-5">
            <BounceLoader size={150} color="#36d7b7" />
            <h5>Sending message, please wait...</h5>
          </div>
        ) : (
          <Modal.Body>
            <div className="title bg-primary w-100">
              <h5 className="text-white mx-3 p-2 my-3">Details</h5>
            </div>
            <Form.Label>Document Code</Form.Label>

            <Form.Group
              className="mb-3 flex"
              controlId="exampleForm.ControlInput1"
            >
              <Form.Control
                value={code}
                onChange={(e) => setCode(e.target.value)}
                type="text"
                placeholder="Document Code"
              />
              <Button onClick={generateRandomCode}>Generate</Button>
            </Form.Group>
            <Form.Label>Sender</Form.Label>
            <Form.Control
              onChange={(e) => setSender(e.target.value)}
              type="text"
              placeholder="Sender"
            />

            <Form.Group
              onChange={(e) => setSubject(e.target.value)}
              className="mb-3"
              controlId="exampleForm.ControlInput1"
            >
              <Form.Label>Subject</Form.Label>
              <Form.Control type="email" />
            </Form.Group>
            <Form.Group
              className="mb-3"
              controlId="exampleForm.ControlTextarea1"
            >
              <Form.Label>Description</Form.Label>
              <Form.Control
                onChange={(e) => setDescription(e.target.value)}
                as="textarea"
                rows={3}
              />
            </Form.Group>
            <div className="row">
              <div className="col-lg-6">
                <Form.Label>Prioritization</Form.Label>
                <Form.Select
                  onChange={(e) => setPrioritization(e.target.value)}
                  className="mb-3"
                >
                  <option>Please select an option</option>
                  <option value="urgent">Urgent</option>
                  <option value="usual">Usual</option>
                </Form.Select>
              </div>

              <div className="col-lg-6">
                <Form.Label>Classification</Form.Label>

                <Form.Select
                  onChange={(e) => setClassification(e.target.value)}
                  className="mb-3"
                >
                  <option>Please select an option</option>
                  <option value="memorandum">Memorandum</option>
                  <option value="letter">Letter</option>
                  <option value="indorsement/transmittal">
                    Indorsement/Transmittal
                  </option>
                </Form.Select>
              </div>
              <div className="col-lg-6">
                <Form.Label>Sub Classification</Form.Label>

                <Form.Select
                  onChange={(e) => setSubClassification(e.target.value)}
                  className="mb-3"
                >
                  <option>Please select an option</option>
                  <option value="compliance">For Compliance</option>
                  <option value="information">For Information</option>
                  <option value="inquiry">Inquiry</option>
                  <option value="invitation">Invitation</option>
                  <option value="request">Request</option>
                  <option value="others">Others</option>
                </Form.Select>
              </div>
              <div className="col-lg-6">
                <Form.Label>Action</Form.Label>

                <Form.Select
                  onChange={(e) => setAction(e.target.value)}
                  className="mb-3"
                >
                  <option>Please select an option</option>
                  <option value="For Submission of Documents">
                    For Submission of Documents
                  </option>
                  <option value="For Approval/Signature">
                    For Approval/Signature
                  </option>
                  <option value="For Monitoring">For Monitoring</option>
                  <option value="For Comment/Justification">
                    For Comment/Justification
                  </option>
                  <option value="For Considilation">For Considilation</option>
                  <option value="For Printing">For Printing</option>
                </Form.Select>
              </div>
              <div className="col-lg-6">
                <Form.Label>Due Date (Optional)</Form.Label>
                <Form.Control
                  onChange={(e) => setDueDate(e.target.value)}
                  type="date"
                />
              </div>
              <div className="col-lg-6">
                <Form.Label>Deliver Type</Form.Label>

                <Form.Select
                  onChange={(e) => setDeliverType(e.target.value)}
                  className="mb-3"
                >
                  <option>Please select an option</option>
                  <option value="Through DMS">Through DMS</option>
                  <option value="Hand-over">Hand-over</option>
                  <option value="Combination">Combination</option>
                </Form.Select>
              </div>
              <div className="col-lg-6">
                <Form.Label>Document Flow</Form.Label>

                <Form.Select
                  onChange={(e) => setDocumentFlow(e.target.value)}
                  className="mb-3"
                >
                  <option>Please select an option</option>
                  <option value="Internal">Internal</option>
                  <option value="External">External</option>
                </Form.Select>
              </div>
            </div>
            <div className="title bg-primary w-100">
              <h5 className="text-white mx-3 p-2 my-3">Attachments</h5>
            </div>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Details</Form.Label>
              <Form.Control
                onChange={(e) => setAttachmentDetail(e.target.value)}
                type="text"
              />
              <Form.Group controlId="formFile" className="mb-3">
                <Form.Label>Choose File</Form.Label>
                <Form.Control
                  onChange={(e) => setFile(e.target.files[0])}
                  type="file"
                />
              </Form.Group>
            </Form.Group>
          </Modal.Body>
        )}

        <Modal.Footer>
          <ConfirmationModal />
        </Modal.Footer>
      </Modal>
    );
  }

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

    const handleSeen = async () => {
      const docRef = doc(db, "routing", message.id, message.id, message.id);
      const res = await getDoc(docRef);
      if (!res.exists()) {
        setDoc(docRef, {
          createdAt: serverTimestamp(),
          message: message,
          status: "Seen",
        });
      }
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
              handleSeen();
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

  function DropdownActionExternal({ message }) {
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
      const docRef = doc(db, "incoming-external", message.id);
      deleteDoc(docRef).then(() => toast.success("Successfully Deleted!"));
    };

    return (
      <Dropdown>
        <Dropdown.Toggle variant="secondary" id="dropdown-basic">
          <img src="./assets/images/pepicons-pencil_dots-y.png" alt="" />
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <Dropdown.Item onClick={handleDelete}>
            Delete <FaTrash />
          </Dropdown.Item>
          <Dropdown.Item onClick={downloadFIle}>
            Download <FaDownload />
          </Dropdown.Item>

          {/* <Dropdown.Item
            onClick={() => {
              setCurrentMessage(message);
              setShowRouting(true);
            }}
          >
            View Routing <FaMap />
          </Dropdown.Item> */}
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
            message.sender == message.reciever
          ) {
            messages.push(message);
            if (
              message.prioritization == "urgent" &&
              message.status == "Pending"
            ) {
              urgents.push(message);
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
    onSnapshot(incomingExternalRef, (snapshot) => {
      const messages = [];
      snapshot.docs.forEach((doc) => {
        const message = { ...doc.data(), id: doc.id };
        if (message.reciever === auth.currentUser.uid) {
          messages.push(message);
        }
      });
      setExternalMessages(messages);
    });

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
        <Routing
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

      {auth.currentUser && users && (
        <ComposeModal
          show={composeModalOpen}
          onHide={() => setComposeModalOpen(false)}
          currentUser={auth.currentUser}
          users={users}
        />
      )}

      <div className="dashboard">
        <div className="dashboard-content mx-3 mt-3">
          <div className="row">
            <div className="wrapper col-lg-8">
              <h2 className="fw-bold my-3 mx-2">
                Incoming Messages
                <FaFacebookMessenger className="mx-2" />
              </h2>
              <div
                className="bg-info mx-2 mb-3"
                style={{ width: "200px", height: "10px", borderRadius: 20 }}
              ></div>
            </div>
            {currentPage == "external" && (
              <div className="col-lg-4 flex justify-content-end">
                <img
                  onClick={() => setComposeModalOpen(true)}
                  className="mx-3"
                  src="./assets/images/Group 8779.png"
                  alt=""
                />
              </div>
            )}
          </div>
          <div className="row">
            <div className="col-lg-7">
              <ListGroup horizontal>
                <ListGroup.Item
                  className={`${
                    currentPage == "internal" ? "bg-info text-white" : ""
                  } px-5 fw-bold`}
                  onClick={() => setCurrentPage("internal")}
                >
                  Internal
                </ListGroup.Item>
                <ListGroup.Item
                  className={`${
                    currentPage == "external" ? "bg-info text-white" : ""
                  } px-5 fw-bold`}
                  onClick={() => setCurrentPage("external")}
                >
                  External
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

          {currentPage == "internal" ? (
            <Table responsive="md" bordered variant="white">
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

                      {message.date && (
                        <td>{moment(message.date.toDate()).format("LL")}</td>
                      )}
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
          ) : (
            <Table responsive="md" bordered variant="white">
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
                {externalMessages.map((message) => {
                  return (
                    <tr key={message.code}>
                      <td>
                        <div className="flex">
                          <FaFile />
                          {message.code}
                        </div>
                      </td>
                      <td>{message.fileName}</td>

                      <td>{message.sender} -</td>
                      <td>{message.action}</td>

                      {message.date && (
                        <td>{moment(message.date.toDate()).format("LL")}</td>
                      )}
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
                        <Badge bg="warning" className="text-black p-2">
                          {message.status}
                        </Badge>
                      </td>
                      <td className="flex">
                        <DropdownActionExternal message={message} />
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

export default incoming;
