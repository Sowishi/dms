import {
  FaSearch,
  FaFile,
  FaTrash,
  FaEye,
  FaDownload,
  FaMap,
  FaInbox,
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
  setDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { auth, db, storage } from "../../firebase";
import BounceLoader from "react-spinners/BounceLoader";
import Dropdown from "react-bootstrap/Dropdown";

import { useEffect, useRef, useState } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { toast } from "react-toastify";
import { createUserWithEmailAndPassword } from "firebase/auth";
import LayoutUser from "../layout/layoutUser";
import Offcanvas from "react-bootstrap/Offcanvas";
import ViewModal from "../components/viewModal";
import PlaceHolder from "../components/placeholder";
import moment from "moment";
import axios from "axios";
import Routing from "../components/routing";
import emailjs from "emailjs-com";

const userCollectionRef = collection(db, "users");
const messagesCollectionRef = collection(db, "messages");
const outgoingExternal = collection(db, "outgoing-external");
const officeCollection = collection(db, "offices");

const UserOutgoing = () => {
  const [modalShow, setModalShow] = useState(false);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState(null);
  const [showRouting, setShowRouting] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [enableSMS, setEnableSMS] = useState(false);
  const [currentPage, setCurrentPage] = useState("internal");
  const [externalMessages, setExternalMessages] = useState([]);
  const [search, setSearch] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [offices, setOffices] = useState([]);

  const getOfficeStatus = (id) => {
    const office = offices.filter((office) => {
      if (office.id == id) {
        return office;
      }
    });
    return office[0] == undefined ? "Unknown" : office[0].status;
  };

  function DeleteModal() {
    const handleDelete = () => {
      const docMessage = doc(db, "messages", currentMessage.id);
      deleteDoc(docMessage).then(() => toast.success("Successfully Deleted!"));
      setDeleteModal(false);
    };
    return (
      <>
        <Modal show={deleteModal} onHide={() => setDeleteModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Delete Confirmation</Modal.Title>
          </Modal.Header>
          <Modal.Body>Are you sure you want to continue?</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleDelete}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }

  function ComposeModal(props) {
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
        attachmentDetail
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

    const handleSendSMS = async () => {
      const textReciever = getUser(reciever);
      const textSender = getUser(props.currentUser.uid);

      const message = `You have received a new message from ${textSender.fullName} with a subject: ${subject}. Please log in to your account to view and respond to the message.`;

      try {
        const username = "Sowishi";
        const password = "sdfsdfjsdlkfjsdjfsld3533535GKJlgfgjdlf@";
        const credentials = `${username}:${password}`;
        const encodedCredentials = `Basic ${btoa(credentials)}`;
        const axiosSettings = {
          url: "https://j3q9x4.api.infobip.com/sms/2/text/advanced",
          method: "POST",
          timeout: 0,
          headers: {
            Authorization: encodedCredentials,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          data: {
            messages: [
              {
                destinations: [
                  {
                    to: `+63${textReciever.phone}`,
                  },
                ],
                from: "Document Management System",
                text: message,
              },
            ],
          },
        };
        axios(axiosSettings)
          .then((response) => {
            console.log(response.data);
          })
          .catch((error) => {
            console.error("Request failed", error);
          });
      } catch (error) {
        toast.error(error.toString());
      }
    };

    const sendEmail = (docLink) => {
      const emailReciever = getUser(reciever);
      const emailSender = getUser(props.currentUser.uid);
      console.log(emailReciever, emailSender);

      const templateParams = {
        sender: emailSender.fullName,
        reciever: emailReciever.fullName,
        subject: subject,
        prioritization: prioritization,
        date: moment(serverTimestamp()).format("LL"),
        sender_email: emailSender.email,
        sender_position: emailSender.position,
        to_email: emailReciever.email,
        document_link: docLink,
      };

      emailjs
        .send(
          "document_management_syst", // Replace with your EmailJS service ID
          "template_u2b7th8", // Replace with your EmailJS template ID
          templateParams,
          "CC6NDqZK6hJlZZd_X" // Replace with your EmailJS user ID
        )
        .then((result) => {
          console.log(result.text);
        })
        .catch((error) => {
          console.error("Error sending email:", error);
        });
    };

    const handleSubmit = (fileUrl) => {
      let documentState = "Pending";
      if (currentPage == "external") {
        documentState = "Recieved";
      }
      if (!file) {
        documentState = "In Progress";
      }

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
          fileUrl: fileUrl || "N/A",
          fileName: file.name || "N/A",
          status: documentState,
          createdAt: serverTimestamp(),
          isSendToALl: props.currentUser.uid === reciever,
        };

        if (currentPage == "internal") {
          addDoc(messagesCollectionRef, dataObject).then((document) => {
            addDoc(collection(db, "routing", document.id, document.id), {
              createdAt: serverTimestamp(),
              message: dataObject,
              status: "Created",
            });
            toast.success("Your message is succesfully sent!");
            setModalShow(false);
          });
        } else {
          addDoc(outgoingExternal, dataObject).then(() => {
            toast.success("Your message is succesfully sent!");
            setModalShow(false);
          });
        }
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
                if (enableSMS && currentPage == "internal") {
                  // handleSendSMS();
                  sendEmail(url);
                }
                handleSubmit(url);
              }
            })
            .catch((error) => {
              console.error("Error getting download URL:", error);
            });
        });
      } else {
        handleSubmit();
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

            {currentPage == "internal" && (
              <Form.Select
                onChange={(e) => setReciever(e.target.value)}
                className="mb-3"
              >
                <option key={0} value={0}>
                  Please select a reciever
                </option>

                {users &&
                  users.map((user) => {
                    if (
                      user.id !== props.currentUser.uid &&
                      getOfficeStatus(user.office) == "Active"
                    ) {
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
            )}
            {currentPage == "external" && (
              <Form.Control
                type="text"
                onChange={(e) => setReciever(e.target.value)}
              />
            )}

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
                  {currentPage == "internal" ? (
                    <option value="Internal">Internal</option>
                  ) : (
                    <option value="External">External</option>
                  )}
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
                  accept=".pdf"
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
      setCurrentMessage(message);
      setDeleteModal(true);
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
      const docRef = doc(db, "outgoing-external", message.id);
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
              setShowViewModal(true);
              setCurrentMessage(message);
            }}
          >
            View Detail <FaEye />
          </Dropdown.Item>
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

    //Offices

    onSnapshot(officeCollection, (snapshot) => {
      const output = [];
      snapshot.docs.forEach((doc) => {
        output.push({ ...doc.data(), id: doc.id });
      });
      setOffices(output);
    });

    getDoc(doc(db, "sms", "sms")).then((doc) => {
      const output = doc.data();
      setEnableSMS(output.enable);
    });

    const snapshot = await getDocs(userCollectionRef);
    const output = snapshot.docs.map((doc) => {
      return { id: doc.id, ...doc.data() };
    });

    setUsers(output);
    const q = query(messagesCollectionRef, orderBy("createdAt", "desc"));

    onSnapshot(
      q,
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

    const q2 = query(outgoingExternal, orderBy("createdAt", "desc"));
    onSnapshot(q2, (snapshot) => {
      const messages = [];
      snapshot.docs.forEach((doc) => {
        const message = { ...doc.data(), id: doc.id };
        if (message.sender === auth.currentUser.uid) {
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

  const filteredMessages = messages.filter((message) => {
    const sender = getUser(message.sender);
    const reciever = getUser(message.reciever);
    if (
      message.code.toLowerCase().startsWith(search.toLowerCase()) ||
      message.fileName.toLowerCase().startsWith(search.toLowerCase()) ||
      sender.fullName.toLowerCase().startsWith(search.toLowerCase()) ||
      reciever.fullName.toLowerCase().startsWith(search.toLowerCase()) ||
      message.subject.toLowerCase().startsWith(search.toLocaleLowerCase())
    ) {
      return message;
    }
  });

  const filteredExternalMessages = externalMessages.filter((message) => {
    const sender = getUser(message.sender);
    if (
      message.code.toLowerCase().startsWith(search.toLowerCase()) ||
      message.fileName.toLowerCase().startsWith(search.toLowerCase()) ||
      sender.fullName.toLowerCase().startsWith(search.toLowerCase()) ||
      message.subject.toLowerCase().startsWith(search.toLocaleLowerCase())
    ) {
      return message;
    }
  });

  return (
    <LayoutUser>
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
          outgoing={true}
          currentMessage={currentMessage}
          resetCurrentMessage={() => setCurrentMessage(null)}
          closeModal={() => setShowViewModal(false)}
          showModal={showViewModal}
          currentPage={currentPage}
        />
      )}

      {auth.currentUser && (
        <ComposeModal
          show={modalShow}
          onHide={() => setModalShow(false)}
          currentUser={auth.currentUser}
        />
      )}

      <DeleteModal />

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
                  onChange={(e) => setSearch(e.target.value)}
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
            <Table responsive="md" bordered hover variant="white">
              <thead>
                <tr>
                  <th>DocID</th>
                  <th>Subject</th>
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
                {filteredMessages.map((message) => {
                  return (
                    <tr key={message.code}>
                      <td>
                        <div className="flex">
                          <FaFile />
                          {message.code}
                        </div>
                      </td>
                      <td>{message.subject}</td>
                      <td
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          setCurrentMessage(message);
                          setShowViewModal(true);
                        }}
                      >
                        <div
                          style={{ textDecoration: "underline" }}
                          className="text-info fw-bold"
                        >
                          {message.fileName}
                        </div>
                      </td>
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
                        <td>{moment(message.date.toDate()).format("LLL")}</td>
                      )}
                      <td>
                        <div className="flex">
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
                        </div>
                      </td>
                      <td>
                        <div className="flex">
                          {message.status === "Recieved" && (
                            <Badge bg="success" className="text-white p-2">
                              {message.status}
                            </Badge>
                          )}
                          {message.status === "Pending" && (
                            <Badge bg="info" className="text-white p-2">
                              {message.status}
                            </Badge>
                          )}
                          {message.status === "Rejected" && (
                            <Badge bg="danger" className="text-white p-2">
                              {message.status}
                            </Badge>
                          )}
                          {message.status === "In Progress" && (
                            <Badge bg="warning" className="text-black p-2">
                              {message.status}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="flex">
                          <DropdownAction message={message} />
                        </div>
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
                  <th>Subject</th>
                  <th>File Name</th>
                  <th>Sender</th>
                  <th>Required Action</th>
                  <th>Date </th>
                  <th>Prioritization</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              {externalMessages && (
                <tbody>
                  {filteredExternalMessages.map((message) => {
                    return (
                      <tr key={message.code}>
                        <td>
                          <div className="flex">
                            <FaFile />
                            {message.code}
                          </div>
                        </td>
                        <td>{message.subject}</td>
                        <td>{message.fileName}</td>
                        <td>{message.reciever} -</td>
                        <td>{message.action}</td>

                        {message.date && (
                          <td>{moment(message.date.toDate()).format("LLL")}</td>
                        )}
                        <td>
                          <div className="flex">
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
                          </div>
                        </td>
                        <td>
                          <div className="flex">
                            {message.status === "Recieved" && (
                              <Badge bg="success" className="text-white p-2">
                                {message.status}
                              </Badge>
                            )}
                            {message.status === "Pending" && (
                              <Badge bg="info" className="text-white p-2">
                                {message.status}
                              </Badge>
                            )}
                            {message.status === "Rejected" && (
                              <Badge bg="danger" className="text-white p-2">
                                {message.status}
                              </Badge>
                            )}
                            {message.status === "In Progress" && (
                              <Badge bg="warning" className="text-black p-2">
                                {message.status}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="flex">
                            <DropdownActionExternal message={message} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              )}
            </Table>
          )}
        </div>
      </div>
    </LayoutUser>
  );
};

export default UserOutgoing;
