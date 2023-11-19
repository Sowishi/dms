import { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { FaBook, FaEye, FaUser } from "react-icons/fa";
import Badge from "react-bootstrap/Badge";
import { ModalBody } from "react-bootstrap";

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

  function toTitleCase(str) {
    return str.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }
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
              <h5 className="fw-bold">
                <FaUser /> Username -{" "}
                {props.getUser(currentMessage.sender).fullName}
              </h5>
            </div>
            <div className="col-lg-6 d-flex justify-content-end align-items-center">
              Date: {currentMessage.date}
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
            <div className="details-header w-100 bg-secondary p-2">
              <h5>
                {" "}
                <FaBook /> Action
              </h5>
            </div>
            <div className="content">
              <div className="form-wrapper">
                <label htmlFor="">Remarks</label>
                <textarea rows={5} type="text" className="form-control" />
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="row w-100">
            <div className="col-lg-6 flex">
              <Button className="w-100 text-white" variant="danger">
                Rejected
              </Button>
            </div>
            <div className="col-lg-6 flex">
              <Button className="w-100" variant="primary">
                Approved
              </Button>
            </div>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ViewModal;
