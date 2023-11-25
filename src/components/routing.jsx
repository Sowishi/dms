import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { Offcanvas } from "react-bootstrap";
import { FaCheck, FaEye, FaFile } from "react-icons/fa";
import moment from "moment";

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

  return (
    <>
      <Offcanvas
        placement="end"
        show={props.showRouting}
        onHide={props.handleCloseRouting}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Document Routing</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {routing &&
            routing.map((route) => {
              return (
                <div className="div">
                  <div className="row">
                    {route.createdAt && (
                      <div className="col-5 py-4 d-flex justify-content-start alig-items-start">
                        {moment(route.createdAt.toDate()).format("LLL")}
                      </div>
                    )}

                    <div className="col-2 flex flex-column">
                      <div
                        className="div "
                        style={{
                          height: "100%",
                          width: "5px",
                          background: "gray",
                        }}
                      ></div>
                      {route.status == "Recieved" && (
                        <FaFile size={30} className="my-1" />
                      )}
                      {route.status == "Seen" && (
                        <FaEye size={30} className="my-1" />
                      )}
                      {route.status == "Created" && (
                        <FaCheck size={30} className="my-1" />
                      )}
                    </div>
                    <div className="col-5 py-4 flex">
                      <h5>{route.status}</h5>
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
