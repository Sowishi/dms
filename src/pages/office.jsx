import { useEffect, useState } from "react";
import Layout from "../layout/layout";
import {
  Button,
  Dropdown,
  Modal,
  Table,
  Form,
  Badge,
  ListGroup,
} from "react-bootstrap";
import { FaDownload, FaEye, FaFile, FaSuitcase, FaTrash } from "react-icons/fa";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { toast } from "react-toastify";

function DropdownAction({ message }) {
  const handleDelete = () => {
    try {
      const docRef = doc(db, "offices", message.id);
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
        <Dropdown.Item onClick={handleDelete}>
          Delete <FaTrash />
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}

const Office = () => {
  const officeCollection = collection(db, "offices");

  const [loading, setLoading] = useState();
  const [offices, setOffices] = useState([]);
  const [officeModal, setOfficeModal] = useState(false);

  function OfficeModal(props) {
    const [officeName, setOfficeName] = useState("");
    const [officeCode, setOfficeCode] = useState("");
    const [status, setStatus] = useState("");

    const generateRandomCode = () => {
      const min = 1000;
      const max = 99999;
      const code = Math.floor(Math.random() * (max - min + 1)) + min;
      return code;
    };

    const handleSubmit = () => {
      try {
        const data = {
          officeID: generateRandomCode(),
          officeName: officeName,
          officeCode: officeCode,
          status: status,
        };

        addDoc(officeCollection, data).then(() => {
          toast.success("Successfully add office!");
          setOfficeModal(false);
        });
      } catch (error) {
        toast.success(error.message);
      }
    };

    return (
      <Modal
        {...props}
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header className="bg-primary">
          <h5 className="fw-bold text-white">Add Office</h5>
        </Modal.Header>
        <Modal.Body>
          <div className="wrapper">
            <label htmlFor="officeName">Office Name</label>
            <Form.Control
              type="text"
              id="officeName"
              className="form-control bg-secondary"
              value={officeName}
              onChange={(e) => setOfficeName(e.target.value)}
            />
          </div>
          <div className="wrapper">
            <label htmlFor="officeCode">Office Code</label>
            <Form.Control
              type="text"
              id="officeCode"
              className="form-control bg-secondary"
              value={officeCode}
              onChange={(e) => setOfficeCode(e.target.value)}
            />
          </div>
          <div className="wrapper">
            <label htmlFor="status">Status</label>
            <Form.Select
              id="status"
              className="bg-secondary"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option>Please select an option</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </Form.Select>{" "}
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={handleSubmit}>Add Office</Button>
        </Modal.Footer>
      </Modal>
    );
  }

  const fetchData = () => {
    onSnapshot(officeCollection, (snapshot) => {
      const output = [];
      snapshot.docs.forEach((doc) => {
        output.push({ ...doc.data(), id: doc.id });
      });
      setOffices(output);
    });
  };

  const handleAction = (office, status) => {
    try {
      const officeRef = doc(db, "offices", office.id);
      updateDoc(officeRef, {
        status: status,
      });
    } catch (error) {}
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Layout>
      <OfficeModal show={officeModal} onHide={() => setOfficeModal(false)} />
      {loading && <PlaceHolder />}

      <div className="row">
        <div className="col-8">
          <div className="wrapper">
            <h2 className="fw-bold my-3 mx-2">
              Office Management <FaSuitcase />
            </h2>
            <div
              className="bg-info mx-2 mb-3"
              style={{ width: "200px", height: "10px", borderRadius: 20 }}
            ></div>
          </div>
        </div>
        <div className="col-4 flex">
          <Button variant="primary mb-2" onClick={() => setOfficeModal(true)}>
            <h6 className="fw-bold text-white px-3 mb-0 py-1">Add Office</h6>
          </Button>
        </div>
      </div>

      <Table responsive="md" bordered hover variant="white">
        <thead>
          <tr>
            <th>Office ID</th>
            <th>Office Name</th>
            <th>Office Code</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {offices.map((message) => {
            return (
              <tr key={message.officeID}>
                <td>
                  <div>{message.id}</div>
                </td>
                <td>{message.officeName}</td>

                <td>{message.officeCode}</td>
                <td>
                  <div className="flex">
                    <ListGroup horizontal>
                      <ListGroup.Item>
                        <Button
                          onClick={() => handleAction(message, "Active")}
                          className={`${
                            message.status == "Active"
                              ? "bg-success text-white"
                              : "bg-secondary"
                          }`}
                        >
                          Active
                        </Button>
                      </ListGroup.Item>
                      <ListGroup.Item>
                        {" "}
                        <Button
                          onClick={() => handleAction(message, "Inactive")}
                          className={`${
                            message.status == "Inactive"
                              ? "bg-danger text-white"
                              : "bg-secondary"
                          }`}
                        >
                          Inactive
                        </Button>
                      </ListGroup.Item>
                    </ListGroup>
                  </div>

                  {/* <Badge
                    className={
                      message.status == "Active"
                        ? "bg-success p-2 flex"
                        : "bg-danger p-2 flex"
                    }
                  >
                    {message.status}
                  </Badge> */}
                </td>

                <td className="flex">
                  <DropdownAction message={message} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Layout>
  );
};

export default Office;
