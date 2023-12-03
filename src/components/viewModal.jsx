import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { FaBook, FaEye, FaUser } from "react-icons/fa";
import Badge from "react-bootstrap/Badge";
import { ModalBody, Spinner } from "react-bootstrap";
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
import { auth, db, storage } from "../../firebase";
import { toast } from "react-toastify";
import moment from "moment";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

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

  const isDisable =
    currentMessage.status == "Pending" ||
    currentMessage.status == "In Progress";

  const [sender, setSender] = useState("");
  const [reciever, setReciever] = useState("");
  const [remarks, setRemarks] = useState("");
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [confirmation, setConfirmation] = useState(false);
  const [action, setAction] = useState(null);

  function Confirmation() {
    return (
      <>
        <Modal show={confirmation} onHide={() => setConfirmation(false)}>
          <Modal.Header closeButton>
            <Modal.Title>{action} Confirmation</Modal.Title>
          </Modal.Header>
          <Modal.Body>Are you sure you want to continue?</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setConfirmation(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                handleAction(action);
                setConfirmation(false);
                props.closeModal();
              }}
            >
              Confirm
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }

  function toTitleCase(str) {
    return str.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

  const getOffice = (id) => {
    const output = offices.filter((office) => {
      if (office.id == id) {
        return office;
      }
    });
    return output[0];
  };
  useEffect(() => {
    getDocs(collection(db, "offices")).then((res) => {
      const offices = [];
      res.docs.forEach((doc) => {
        offices.push({ ...doc.data(), id: doc.id });
      });
      setOffices(offices);
    });
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

    if (type == "Received") {
      addDoc(collection(db, "routing", currentMessage.id, currentMessage.id), {
        createdAt: serverTimestamp(),
        message: currentMessage,
        status: "Received",
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
      if (type == "Received") {
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

  const handleSubmit = (url) => {
    if (props.currentPage == "internal") {
      const messageRef = doc(db, "messages", currentMessage.id);
      updateDoc(messageRef, {
        fileUrl: url,
        fileName: file.name,
        status: "Pending",
        remarks: remarks,
      });
      props.closeModal();
      props.resetCurrentMessage();
    } else {
      const messageRef = doc(db, "outgoing-external", currentMessage.id);
      updateDoc(messageRef, {
        fileUrl: url,
        fileName: file.name,
        status: "Received",
      });
      props.closeModal();
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
              setLoading(false);
            }
          })
          .catch((error) => {
            console.error("Error getting download URL:", error);
          });
      });
    } else {
      toast.error("No files");
      setLoading(false);
    }
  };

  return (
    <>
      <Confirmation />
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
              {!props.dashboard &&
                props.currentPage == "internal" &&
                currentMessage && (
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
                    disabled
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
                    disabled
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
                    disabled
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
              {currentMessage.status !== "In Progress" && (
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
              )}

              {currentMessage.status == "In Progress" &&
                auth.currentUser.uid == currentMessage.sender && (
                  <div className="col-12 my-3 flex justify-content-start align-items-center">
                    <div className="wrapper w-75">
                      <label htmlFor="">Add file</label>
                      <input
                        accept=".pdf"
                        onChange={(e) => setFile(e.target.files[0])}
                        type="file"
                        className="form-control"
                      />
                    </div>

                    <button
                      onClick={handleUpload}
                      className="btn btn-primary  mb-0 mx-3"
                    >
                      {loading ? (
                        <Spinner animation="border" variant="secondary" />
                      ) : (
                        "Upload File"
                      )}
                    </button>
                  </div>
                )}
              {currentMessage.status == "Rejected" &&
                auth.currentUser.uid == currentMessage.sender &&
                !props.dashboard && (
                  <>
                    <div className="col-12 my-3 flex justify-content-start align-items-center">
                      <div className="wrapper w-75">
                        <label htmlFor="">Add file</label>
                        <input
                          accept=".pdf"
                          onChange={(e) => setFile(e.target.files[0])}
                          type="file"
                          className="form-control"
                        />
                      </div>
                    </div>
                    <div className="col-12">
                      <label htmlFor="">Add remarks</label>
                      <input
                        onChange={(e) => setRemarks(e.target.value)}
                        type="text"
                        className="form-control"
                      />
                    </div>{" "}
                    <div className="col-12 d-flex justify-content-end align-items-center my-2">
                      <button
                        onClick={handleUpload}
                        className="btn btn-primary  mb-0 mx-3"
                      >
                        {loading ? (
                          <Spinner animation="border" variant="secondary" />
                        ) : (
                          "Resend File"
                        )}
                      </button>
                    </div>
                  </>
                )}
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
              {currentMessage.reciever == auth.currentUser.uid && (
                <div className="col-12 d-flex w-100 justify-content-center align-items-center">
                  <div className="wrapper w-100">
                    <label htmlFor="">Add remarks</label>
                    <input
                      onChange={(e) => setRemarks(e.target.value)}
                      type="text"
                      className="form-control"
                    />
                  </div>
                </div>
              )}

              <div className="form-wrapper">
                <label htmlFor="">Document Remarks</label>
                <textarea
                  disabled
                  onChange={(e) => setRemarks(e.target.value)}
                  value={currentMessage.remarks}
                  rows={4}
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
                  disabled={!isDisable}
                  onClick={() => {
                    setAction("Rejected");
                    setConfirmation(true);
                  }}
                  className="w-100 text-white"
                  variant="danger"
                >
                  Rejected
                </Button>
              </div>
              <div className="col-lg-6 flex">
                <Button
                  disabled={!isDisable}
                  onClick={() => {
                    setAction("Received");
                    setConfirmation(true);
                  }}
                  className="w-100"
                  variant="primary"
                >
                  Received
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
