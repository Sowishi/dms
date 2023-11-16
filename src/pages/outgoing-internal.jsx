import { FaSearch, FaFile } from "react-icons/fa";
import ListGroup from "react-bootstrap/ListGroup";
import Badge from "react-bootstrap/Badge";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db, storage } from "../../firebase";

import { useEffect, useRef, useState } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

const userCollectionRef = collection(db, "users");

const OutgoingInternal = () => {
  const [modalShow, setModalShow] = useState(false);
  const [allSender, setAllSender] = useState([]);
  const [allReciever, setAllReciever] = useState([]);

  const codeRef = useRef();

  function MyVerticallyCenteredModal(props) {
    const [code, setCode] = useState("");
    const [sender, setSender] = useState("");
    const [reciever, setReciever] = useState("");
    const [subject, setSubject] = useState("");
    const [description, setDescription] = useState("");
    const [prioritization, setPrioritization] = useState("");
    const [date, setDate] = useState(null);
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

    const handleSubmit = (fileUrl) => {
      console.log(
        codeRef.current.value,
        sender,
        reciever,
        subject,
        description,
        prioritization,
        date,
        classification,
        subClassification,
        action,
        dueDate,
        deliverType,
        documentFlow,
        attachmentDetail,
        file,
        fileUrl
      );
      setLoading(false);
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
        {loading && <h1>Loading...</h1>}

        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">Compose</Modal.Title>
        </Modal.Header>
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
              ref={codeRef}
              type="text"
              placeholder="QR CODE"
            />
            <Button onClick={generateRandomCode}>Generate</Button>
          </Form.Group>
          <Form.Label>Sender</Form.Label>

          <Form.Select
            onChange={(e) => setSender(e.target.value)}
            className="mb-3"
          >
            <option key={0} value={0}>
              Please select a sender
            </option>
            {allSender &&
              allSender.map((sender) => {
                return (
                  <option key={sender.userID} value={sender.userID}>
                    {sender.fullName}
                  </option>
                );
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
            {allReciever &&
              allReciever.map((reciever) => {
                return (
                  <option key={reciever.userID} value={reciever.userID}>
                    {reciever.fullName}
                  </option>
                );
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
          <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
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
              <Form.Label>Date</Form.Label>
              <Form.Control
                onChange={(e) => setDate(e.target.value)}
                type="date"
              />
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
              <Form.Label>Due Date</Form.Label>
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
        <Modal.Footer>
          <Button className="px-5" onClick={handleUpload}>
            Send
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  const fetchData = async () => {
    const snapshot = await getDocs(userCollectionRef);
    const output = snapshot.docs.map((doc) => {
      return { id: doc.id, ...doc.data() };
    });
    const sender = output.filter((user) => {
      if (user.role == "admin") {
        return user;
      }
    });
    const reciever = output.filter((user) => {
      if (user.role == "user") {
        return user;
      }
    });
    setAllSender(sender);
    setAllReciever(reciever);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="dashboard">
      <div className="dashboard-header ">
        <div className="row">
          <div className="col-lg-6 flex justify-content-start">
            <img
              onClick={() => setModalShow(true)}
              className="mx-3"
              src="./assets/images/Group 8779.png"
              alt=""
            />
          </div>
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
                <img src="./assets/images/pepicons-pencil_dots-y.png" alt="" />
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
                <img src="./assets/images/pepicons-pencil_dots-y.png" alt="" />
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
                <img src="./assets/images/pepicons-pencil_dots-y.png" alt="" />
              </td>
            </tr>
          </tbody>
        </Table>
      </div>
      <MyVerticallyCenteredModal
        show={modalShow}
        onHide={() => setModalShow(false)}
      />
    </div>
  );
};

export default OutgoingInternal;
