import { useState } from "react";
import Layout from "../layout/layout";
import { Dropdown, Table } from "react-bootstrap";
import { FaSuitcase } from "react-icons/fa";

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
const Office = () => {
  const [loading, setLoading] = useState();
  const [offices, setOffices] = useState([]);

  return (
    <Layout>
      {loading && <PlaceHolder />}

      <div className="wrapper">
        <h2 className="fw-bold my-3 mx-2">
          Office Management <FaSuitcase />
        </h2>
        <div
          className="bg-info mx-2 mb-3"
          style={{ width: "200px", height: "10px", borderRadius: 20 }}
        ></div>
      </div>

      <Table responsive bordered hover variant="white">
        <thead>
          <tr>
            <th>Office ID</th>
            <th>Office Name</th>
            <th>Office Code</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {offices.map((message) => {
            return (
              <tr key={message.code}>
                <td>
                  <div className="flex">
                    <FaFile />
                    {message.code}
                  </div>
                </td>
                <td>{message.fileName}</td>

                <td>{message.action}</td>

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
