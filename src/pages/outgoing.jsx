import {
  FaSearch,
  FaFile,
  FaTrash,
  FaEye,
  FaDownload,
  FaMap,
  FaInbox,
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
} from "firebase/firestore";
import { auth, db, storage } from "../../firebase";
import BounceLoader from "react-spinners/BounceLoader";
import Dropdown from "react-bootstrap/Dropdown";

import { useEffect, useRef, useState } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { toast } from "react-toastify";
import { createUserWithEmailAndPassword } from "firebase/auth";
import Layout from "../layout/layout";
import Offcanvas from "react-bootstrap/Offcanvas";
import ViewModal from "../components/viewModal";
import PlaceHolder from "../components/placeholder";
import moment from "moment";
const userCollectionRef = collection(db, "users");
const messagesCollectionRef = collection(db, "messages");

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

const Outgoing = () => {
  const [modalShow, setModalShow] = useState(false);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState(null);
  const [showRouting, setShowRouting] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [loading, setLoading] = useState(false);

  function MyVerticallyCenteredModal(props) {
    const [code, setCode] = useState("");
    const [reciever, setReciever] = useState("");
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
      if (
        code &&
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
          sender: props.currentUser.uid || null,
          reciever: reciever || null,
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
          status: "Pending",
          createdAt: serverTimestamp(),
          isSendToALl: props.currentUser.uid === reciever,
        };

        addDoc(messagesCollectionRef, dataObject).then(() => {
          toast.success("Your message is succesfully sent!");
          setModalShow(false);
        });
      } catch (error) {
        toast.error(error.message);
      }
      // console.log("Code:", code);
      // console.log("Sender:", sender);
      // console.log("Receiver:", reciever);
      // console.log("Subject:", subject);
      // console.log("Description:", description);
      // console.log("Prioritization:", prioritization);
      // console.log("Date:", date);
      // console.log("Classification:", classification);
      // console.log("Subclassification:", subClassification);
      // console.log("Action:", action);
      // console.log("Due Date:", dueDate);
      // console.log("Deliver Type:", deliverType);
      // console.log("Document Flow:", documentFlow);
      // console.log("Attachment Detail:", attachmentDetail);
      // console.log("File:", file);
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

            <Form.Select className="mb-3">
              {users &&
                users.map((user) => {
                  if (user.id == props.currentUser.uid) {
                    return (
                      <option key={user.userID} value={user.id}>
                        {user.fullName}{" "}
                      </option>
                    );
                  }
                })}
            </Form.Select>
            <Form.Label>Reciever</Form.Label>

            <Form.Select
              onChange={(e) => setReciever(e.target.value)}
              className="mb-3"
            >
              <option key={0} value={0}>
                Please select a reciever
              </option>
              <option
                className="bg-primary text-white"
                key={0}
                value={props.currentUser.uid}
              >
                Send to all
              </option>
              {users &&
                users.map((user) => {
                  if (user.id !== props.currentUser.uid) {
                    return (
                      <option
                        className={`${
                          user.role == "admin" ? "bg-info text-white" : ""
                        }`}
                        key={user.id}
                        value={user.id}
                      >
                        {user.fullName}
                      </option>
                    );
                  }
                })}
            </Form.Select>
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
      try {
        const docRef = doc(db, "messages", message.id);
        deleteDoc(docRef).then(() => toast.success("Successfully Deleted!"));
      } catch (error) {
        toast.error(error.message);
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
        querySnapshot.forEach((doc) => {
          const message = { ...doc.data(), id: doc.id };
          if (message.sender == auth.currentUser.uid) {
            messages.push(message);
          }
        });
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
          outgoing={true}
          currentMessage={currentMessage}
          closeModal={() => setShowViewModal(false)}
          showModal={showViewModal}
        />
      )}

      {auth.currentUser && (
        <MyVerticallyCenteredModal
          show={modalShow}
          onHide={() => setModalShow(false)}
          currentUser={auth.currentUser}
        />
      )}

      <div className="dashboard">
        <div className="row">
          <div className="col-lg-8">
            <div className="wrapper">
              <h2 className="fw-bold my-3 mx-2">
                Outgoing Messages
                <FaInbox className="mx-2" />
              </h2>
              <div
                className="bg-info mx-2 mb-3"
                style={{ width: "200px", height: "10px", borderRadius: 20 }}
              ></div>
            </div>
          </div>
          <div className="col-lg-4 flex justify-content-end">
            <img
              onClick={() => setModalShow(true)}
              className="mx-3"
              src="./assets/images/Group 8779.png"
              alt=""
            />
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
          {loading && <PlaceHolder />}

          <Table responsive="md" bordered hover variant="white">
            <thead>
              <tr>
                <th>DocID</th>
                <th>File Name</th>
                <th>Reciever</th>
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
                      {message.sender == message.reciever ? (
                        "Send to all"
                      ) : (
                        <>
                          {getUser(message.reciever).fullName} -
                          <b> {getUser(message.reciever).position}</b>
                        </>
                      )}
                    </td>
                    <td>{message.action}</td>

                    {message.date && (
                      <td>{moment(message.date.toDate()).format("LL")}</td>
                    )}
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

export default Outgoing;
