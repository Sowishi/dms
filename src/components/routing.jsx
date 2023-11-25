import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { Offcanvas } from "react-bootstrap";
import {
  FaCheck,
  FaCheckCircle,
  FaCross,
  FaExclamationCircle,
  FaEye,
  FaFile,
} from "react-icons/fa";
import moment from "moment";
import BounceLoader from "react-spinners/BounceLoader";

const Routing = (props) => {
  const { currentMessage } = props;
  const [routing, setRouting] = useState();

  const getRouting = (currentMessage) => {
    const q = query(
      collection(db, "routing", currentMessage.id, currentMessage.id),
      orderBy("createdAt", "asc")
    );
    onSnapshot(q, (snapshot) => {
      const output = [];
      snapshot.docs.forEach((doc) => {
        output.push({ ...doc.data(), id: doc.id });
      });
      setRouting(output);
    });
  };

  useEffect(() => {
    getRouting(currentMessage);
  }, [currentMessage]);

  let lastItem = 0;

  if (routing) {
    lastItem = routing.length - 1;
  }

  return (
    <>
      <Offcanvas
        placement="end"
        show={props.showRouting}
        onHide={props.handleCloseRouting}
      >
        <Offcanvas.Header className="bg-primary text-white" closeButton>
          <Offcanvas.Title>Document Routing</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="m-3">
          {routing &&
            routing.map((route, index) => {
              return (
                <div className="div">
                  <div className="row">
                    {route.createdAt && (
                      <div
                        style={{ opacity: lastItem == index ? 1 : 0.6 }}
                        className="col-5 py-4 d-flex justify-content-start alig-items-start"
                      >
                        {moment(route.createdAt.toDate()).format("LLL")}
                      </div>
                    )}

                    <div
                      style={{ opacity: lastItem == index ? 1 : 0.6 }}
                      className="col-2 flex flex-column"
                    >
                      <div
                        className="div "
                        style={{
                          height: "100%",
                          width: "2px",
                          background: "gray",
                        }}
                      ></div>
                      {route.status == "Recieved" && (
                        <FaFile color="green" size={30} className="my-1" />
                      )}
                      {route.status == "Seen" && (
                        <FaEye size={30} className="my-1" />
                      )}
                      {route.status == "Created" && (
                        <FaCheckCircle size={30} className="my-1" />
                      )}
                      {route.status == "Rejected" && (
                        <FaExclamationCircle
                          color="red"
                          size={30}
                          className="my-1"
                        />
                      )}{" "}
                    </div>
                    <div
                      style={{ opacity: lastItem == index ? 1 : 0.6 }}
                      className="col-5 py-4 text-left"
                    >
                      <h5
                        className={`fw-bold ${
                          route.status == "Recieved" ? "text-primary" : ""
                        }  ${route.status == "Rejected" ? "text-danger" : ""}`}
                      >
                        {route.status}
                      </h5>
                      {route.status == "Created" && (
                        <p style={{ fontSize: "13px", fontStyle: "italic" }}>
                          your document has been created
                        </p>
                      )}
                      {route.status == "Seen" && (
                        <p style={{ fontSize: "13px", fontStyle: "italic" }}>
                          your document has been seen by the reciever
                        </p>
                      )}
                      {route.status == "Recieved" && (
                        <p style={{ fontSize: "13px", fontStyle: "italic" }}>
                          your document has been seen successfully recieved by
                          the reciever
                        </p>
                      )}
                      {route.status == "Rejected" && (
                        <p style={{ fontSize: "13px", fontStyle: "italic" }}>
                          your document has been seen rejected by the reciever
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default Routing;
