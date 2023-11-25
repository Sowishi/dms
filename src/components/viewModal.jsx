import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { FaBook, FaEye, FaUser } from "react-icons/fa";
import Badge from "react-bootstrap/Badge";
import { ModalBody } from "react-bootstrap";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../../firebase";
import { toast } from "react-toastify";
import moment from "moment";

function ViewFile(props) {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <button onClick={handleShow} className="btn btn-primary mx-3 px-3 flex">
        View <FaEye className="mx-1" />
      </button>

      <Modal size="lg" show={show} onHide={handleClose}>
        <Modal.Header className="bg-primary" closeButton>
          <Modal.Title>File</Modal.Title>
        </Modal.Header>
        <ModalBody>
          <iframe
            style={{ height: "80vh" }}
            src={props.file}
            width={"100%"}
            frameborder="0"
          ></iframe>
        </ModalBody>
      </Modal>
    </>
  );
}

function ViewModal(props) {
  const { currentMessage } = props;

  const [sender, setSender] = useState("");
  const [reciever, setReciever] = useState("");
  const [remarks, setRemarks] = useState("");
  const [offices, setOffices] = useState([]);

  function toTitleCase(str) {
    return str.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

  getDocs(collection(db, "offices")).then((res) => {
    const offices = [];
    res.docs.forEach((doc) => {
      offices.push({ ...doc.data(), id: doc.id });
    });
    setOffices(offices);
  });

  const getOffice = (id) => {
    const output = offices.filter((office) => {
      if (office.id == id) {
        return office;
      }
    });
    return output[0];
  };
  useEffect(() => {
    if (props.dashboard) {
      const senderUser = props.getUser(currentMessage.sender);
      const recieverUser = props.getUser(currentMessage.reciever);

      setSender(senderUser);
      setReciever(recieverUser);
    }
  }, []);

  const handleAction = async (type) => {
    const user = props.getUser(currentMessage.sender);
    const office = getOffice(user.office);

    if (type == "Recieved") {
      addDoc(collection(db, "routing", currentMessage.id, currentMessage.id), {
        createdAt: serverTimestamp(),
        message: currentMessage,
        status: "Recieved",
      });
    } else {
      addDoc(collection(db, "routing", currentMessage.id, currentMessage.id), {
        createdAt: serverTimestamp(),
        message: currentMessage,
        status: "Rejected",
      });
    }

    try {
      const messageRef = doc(db, "messages", currentMessage.id);
      await setDoc(
        messageRef,
        {
          status: type,
          remarks: remarks,
        },
        { merge: true }
      );

      if (!office) {
        addDoc(collection(db, "storage", auth.currentUser.uid, "files"), {
          fileName: currentMessage.fileName,
          fileURL: currentMessage.fileUrl,
          owner: auth.currentUser.uid,
          isFolder: false,
          createdAt: serverTimestamp(),
        });
        toast.success(`Successfully ${type}`);

        return;
      }
      if (type == "Recieved") {
        const folderData = {
          owner: auth.currentUser.uid,
          isFolder: true,
          name: office.officeName,
          createdAt: serverTimestamp(),
        };

        const folderDoc = doc(
          db,
          "storage",
          auth.currentUser.uid,
          "files",
          office.officeName
        );

        const folderExist = await getDoc(folderDoc);
        if (!folderExist.exists()) {
          await setDoc(folderDoc, folderData);
        }

        addDoc(
          collection(db, "storage", auth.currentUser.uid, office.officeName),
          {
            fileName: currentMessage.fileName,
            fileURL: currentMessage.fileUrl,
            owner: auth.currentUser.uid,
            isFolder: false,
            createdAt: serverTimestamp(),
          }
        );
      }
      toast.success(`Successfully ${type}`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <>
      <Modal
        size="xl"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        show={props.showModal}
        onHide={props.closeModal}
      >
        <Modal.Header className="bg-primary" closeButton>
          <Modal.Title>Document Code #{currentMessage.code}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row">
            <div className="col-lg-6">
              {!props.dashboard && (
                <h5 className="fw-bold">
                  <FaUser /> {props.outgoing ? "Reciever" : "Sender"} -{" "}
                  {
                    props.getUser(
                      props.outgoing
                        ? currentMessage.reciever
                        : currentMessage.sender
                    ).fullName
                  }
                  {" - "}
                  {
                    props.getUser(
                      props.outgoing
                        ? currentMessage.reciever
                        : currentMessage.sender
                    ).position
                  }
                </h5>
              )}
              {props.dashboard && sender && reciever && (
                <>
                  <h5 className="fw-bold">
                    {" "}
                    <FaUser />
                    Sender - {sender.fullName} {" - "}
                    {sender.position}
                  </h5>
                  <h5 className="fw-bold">
                    {" "}
                    <FaUser />
                    Reciever - {reciever.fullName} {" - "}
                    {reciever.position}
                  </h5>
                </>
              )}
            </div>
            <div className="col-lg-6 d-flex justify-content-end align-items-center">
              Date: {moment(currentMessage.date.toDate()).format("LL")}
            </div>
          </div>
          <h3 className="text-center">
            {toTitleCase(currentMessage.classification) +
              "/" +
              currentMessage.subject}{" "}
            <Badge
              bg={currentMessage.prioritization == "urgent" ? "danger" : "info"}
            >
              {toTitleCase(currentMessage.prioritization)}
            </Badge>
          </h3>
          <div className="details">
            <div className="details-header w-100 bg-secondary p-2">
              <h5>
                {" "}
                <FaBook /> Details
              </h5>
            </div>
            <div className="row mt-3">
              <div className="col-lg-4 flex">
                <div className="form-wrapper">
                  <label htmlFor="">Required Action</label>
                  <input
                    type="text"
                    className="form-control"
                    value={currentMessage.action}
                  />
                </div>
              </div>
              <div className="col-lg-4 flex">
                <div className="form-wrapper">
                  <label htmlFor="">Delivery Type</label>
                  <input
                    type="text"
                    className="form-control"
                    value={currentMessage.deliverType}
                  />
                </div>
              </div>
              <div className="col-lg-4 flex">
                <div className="form-wrapper">
                  <label htmlFor="">Due Date</label>
                  <input
                    type="text"
                    className="form-control"
                    value={currentMessage.dueDate}
                  />
                </div>
              </div>
              <div className="col-lg-12">
                <div className="form-wrapper">
                  <label htmlFor="">Details</label>
                  <textarea
                    rows={5}
                    type="text"
                    className="form-control"
                    value={currentMessage.description}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="attachment mt-3">
            <div className="attachment-header w-100 bg-secondary p-2">
              <h5>
                {" "}
                <FaBook /> Attachment
              </h5>
            </div>
            <div className="row mt-3">
              <div className="col-12">
                <div className="form-wrapper flex">
                  <input
                    type="text"
                    className="form-control"
                    value={currentMessage.fileName}
                  />

                  <ViewFile file={currentMessage.fileUrl} />
                </div>
              </div>
            </div>
          </div>
          <div className="action mt-3">
            {!props.outgoing && (
              <div className="details-header w-100 bg-secondary p-2">
                <h5>
                  {" "}
                  <FaBook /> Action
                </h5>
              </div>
            )}

            <div className="content">
              <div className="form-wrapper">
                <label htmlFor="">Remarks</label>
                <textarea
                  value={currentMessage.remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={5}
                  type="text"
                  className="form-control"
                />
              </div>
            </div>
          </div>
        </Modal.Body>
        {!props.outgoing && (
          <Modal.Footer>
            <div className="row w-100">
              <div className="col-lg-6 flex">
                <Button
                  onClick={() => handleAction("Rejected")}
                  className="w-100 text-white"
                  variant="danger"
                >
                  Rejected
                </Button>
              </div>
              <div className="col-lg-6 flex">
                <Button
                  onClick={() => handleAction("Recieved")}
                  className="w-100"
                  variant="primary"
                >
                  Recieved
                </Button>
              </div>
            </div>
          </Modal.Footer>
        )}
      </Modal>
    </>
  );
}

export default ViewModal;
