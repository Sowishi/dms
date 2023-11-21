import { useEffect, useState } from "react";
import Layout from "../layout/layout";
import { Button, Dropdown, Modal, Table, Form } from "react-bootstrap";
import {
  FaDownload,
  FaEye,
  FaFile,
  FaSuitcase,
  FaTrash,
  FaUser,
} from "react-icons/fa";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { auth, db } from "../../firebase";
import { toast } from "react-toastify";
import { deleteUser } from "firebase/auth";

function DropdownAction({ message }) {
  const handleDelete = () => {
    try {
      // const docRef = doc(db, "users", message.id);
      // deleteDoc(docRef).then(() => toast.success("Successfully Deleted!"));
      toast.info(
        "You can't delete this user as of now, the user have messages in the database"
      );
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

const CreateUser = () => {
  const userCollection = collection(db, "users");

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
    onSnapshot(userCollection, (snapshot) => {
      const output = [];
      snapshot.docs.forEach((doc) => {
        output.push({ ...doc.data(), id: doc.id });
      });
      setOffices(output);
    });
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
              User Management <FaUser />
            </h2>
            <div
              className="bg-info mx-2 mb-3"
              style={{ width: "200px", height: "10px", borderRadius: 20 }}
            ></div>
          </div>
        </div>
        <div className="col-4 flex">
          <Button variant="primary mb-2" onClick={() => setOfficeModal(true)}>
            <h6 className="fw-bold text-white px-3 mb-0 py-1">Add User</h6>
          </Button>
        </div>
      </div>

      <Table responsive="md" bordered hover variant="info">
        <thead>
          <tr>
            <th>User ID</th>
            <th>Full Name</th>
            <th>Email</th>
            <th>Position</th>
            <th>Office</th>
            <th>Gender</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {offices.map((message) => {
            return (
              <tr key={message.id}>
                <td>
                  <div>{message.id}</div>
                </td>
                <td>{message.fullName}</td>

                <td>{message.email}</td>
                <td>{message.position ? message.position : "N/A"}</td>
                <td>{message.office ? message.position : "N/A"}</td>
                <td>{message.gender ? message.gender : "N/A"}</td>

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

export default CreateUser;
