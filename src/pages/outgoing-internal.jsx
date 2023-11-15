import { FaSearch, FaFile } from "react-icons/fa";
import ListGroup from "react-bootstrap/ListGroup";
import Badge from "react-bootstrap/Badge";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

import { useEffect, useState } from "react";

const userCollectionRef = collection(db, "users");

const OutgoingInternal = () => {
  const [modalShow, setModalShow] = useState(false);
  const [allSender, setAllSender] = useState([]);
  const [allReciever, setAllReciever] = useState([]);
  const [code, setCode] = useState(null);

  function MyVerticallyCenteredModal(props) {
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
        <Modal.Body>
          <div className="title bg-primary w-100">
            <h5 className="text-white mx-3 p-2 my-3">Details</h5>
          </div>
          <Form.Group
            className="mb-3 flex"
            controlId="exampleForm.ControlInput1"
          >
            <Form.Control
              type="text"
              onChange={(e) => {
                setCode(e.target.value);
                e.preventDefault();
              }}
              placeholder="QR CODE"
            />
            <Button onClick={generateCode}>Generate</Button>
          </Form.Group>
          <Form.Label>Sender</Form.Label>

          <Form.Select className="mb-3" aria-label="Default select example">
            {allSender &&
              allSender.map((sender) => {
                return <option value="1">{sender.fullName}</option>;
              })}
          </Form.Select>
          <Form.Label>Reciever</Form.Label>

          <Form.Select className="mb-3" aria-label="Default select example">
            {allReciever &&
              allReciever.map((sender) => {
                return <option value="1">{sender.fullName}</option>;
              })}
          </Form.Select>
          <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
            <Form.Label>Subject</Form.Label>
            <Form.Control type="email" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
            <Form.Label>Example textarea</Form.Label>
            <Form.Control as="textarea" rows={3} />
          </Form.Group>
          <div className="row">
            <div className="col-lg-6">
              <Form.Label>Prioritization</Form.Label>
              <Form.Select className="mb-3" aria-label="Default select example">
                <option>Reciever</option>
                <option value="1">One</option>
                <option value="2">Two</option>
                <option value="3">Three</option>
              </Form.Select>
            </div>
            <div className="col-lg-6">
              <Form.Label>Date</Form.Label>
              <Form.Control type="date" />
            </div>
            <div className="col-lg-6">
              <Form.Label>Classification</Form.Label>

              <Form.Select className="mb-3" aria-label="Default select example">
                <option>Reciever</option>
                <option value="1">One</option>
                <option value="2">Two</option>
                <option value="3">Three</option>
              </Form.Select>
            </div>
            <div className="col-lg-6">
              <Form.Label>Sub Classification</Form.Label>

              <Form.Select className="mb-3" aria-label="Default select example">
                <option>Reciever</option>
                <option value="1">One</option>
                <option value="2">Two</option>
                <option value="3">Three</option>
              </Form.Select>
            </div>
            <div className="col-lg-6">
              <Form.Label>Action</Form.Label>

              <Form.Select className="mb-3" aria-label="Default select example">
                <option>Reciever</option>
                <option value="1">One</option>
                <option value="2">Two</option>
                <option value="3">Three</option>
              </Form.Select>
            </div>
            <div className="col-lg-6">
              <Form.Label>Due Date</Form.Label>

              <Form.Select className="mb-3" aria-label="Default select example">
                <option>Reciever</option>
                <option value="1">One</option>
                <option value="2">Two</option>
                <option value="3">Three</option>
              </Form.Select>
            </div>
            <div className="col-lg-6">
              <Form.Label>Deliver Type</Form.Label>

              <Form.Select className="mb-3" aria-label="Default select example">
                <option>Reciever</option>
                <option value="1">One</option>
                <option value="2">Two</option>
                <option value="3">Three</option>
              </Form.Select>
            </div>
            <div className="col-lg-6">
              <Form.Label>Document Flow</Form.Label>

              <Form.Select className="mb-3" aria-label="Default select example">
                <option>Reciever</option>
                <option value="1">One</option>
                <option value="2">Two</option>
                <option value="3">Three</option>
              </Form.Select>
            </div>
          </div>
          <div className="title bg-primary w-100">
            <h5 className="text-white mx-3 p-2 my-3">Attachments</h5>
          </div>
          <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
            <Form.Label>Details</Form.Label>
            <Form.Control type="text" />
            <Form.Group controlId="formFile" className="mb-3">
              <Form.Label>Choose File</Form.Label>
              <Form.Control type="file" />
            </Form.Group>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button className="px-5" onClick={handleSubmit}>
            Send
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  const handleSubmit = () => {
    addDoc(userCollectionRef, {
      fullName: "Micaela Serrano",
      role: "admin",
      username: "jmmolina",
      password: "123456",
    });
  };

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

  const generateCode = () => {};

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
