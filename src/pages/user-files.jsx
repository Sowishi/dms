import { FaEye, FaFile, FaFolder } from "react-icons/fa";
import Layout from "../layout/layout";
import { Breadcrumb, Button, Dropdown, Modal } from "react-bootstrap";
import { useEffect, useState } from "react";
import { Form } from "react-router-dom";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db, storage } from "../../firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { BarLoader } from "react-spinners";
import { toast } from "react-toastify";
import LayoutUser from "../layout/layoutUser";

const UserFiles = () => {
  const [storages, setStorages] = useState([]);
  const [currentFolder, setCurrentFolder] = useState("files");
  const [loading, setLoading] = useState(false);

  const fetchData = () => {
    setCurrentFolder("files");
    const q = query(
      collection(db, "storage", auth.currentUser.uid, "files"),
      orderBy("createdAt", "desc")
    );
    onSnapshot(q, (snapshot) => {
      const storages = [];
      snapshot.docs.forEach((doc) => {
        const data = { ...doc.data(), id: doc.id };
        storages.push(data);
      });
      setStorages(storages);
    });
  };

  const fetchFolder = (folderName) => {
    const q = query(
      collection(db, "storage", auth.currentUser.uid, folderName),
      orderBy("createdAt", "desc")
    );
    onSnapshot(q, (snapshot) => {
      const storages = [];
      snapshot.docs.forEach((doc) => {
        const data = { ...doc.data(), id: doc.id };
        storages.push(data);
      });
      setStorages(storages);
    });
  };

  function AddFolder(props) {
    const [show, setShow] = useState(false);
    const [folders, setFolders] = useState();
    const [folderName, setFolderName] = useState(null);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const createFolder = () => {
      const data = {
        owner: auth.currentUser.uid,
        isFolder: true,
        name: folderName,
        createdAt: serverTimestamp(),
      };
      addDoc(collection(db, "storage", auth.currentUser.uid, "files"), data);
    };

    return (
      <>
        <Button variant="primary " onClick={handleShow}>
          <h6 className="fw-bold text-white px-3 mb-0 py-1">Add Folder</h6>
        </Button>{" "}
        <Modal size="lg" show={show} onHide={handleClose}>
          <Modal.Header className="bg-primary" closeButton>
            <Modal.Title>Folder Name</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <input
              onChange={(e) => setFolderName(e.target.value)}
              type="text"
              className="form-control"
              placeholder="Folder Name"
            />{" "}
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={createFolder}>Add Folder</Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }

  function AddFile(props) {
    const [show, setShow] = useState(false);
    const [file, setFile] = useState(null);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const createFile = () => {
      setLoading(true);
      if (file) {
        const storageRef = ref(storage, `uploads/${file.name}`);
        uploadBytes(storageRef, file).then((snapshot) => {
          getDownloadURL(storageRef)
            .then((url) => {
              if (url) {
                addDoc(
                  collection(
                    db,
                    "storage",
                    auth.currentUser.uid,
                    currentFolder
                  ),
                  {
                    fileName: file.name,
                    fileURL: url,
                    owner: auth.currentUser.uid,
                    isFolder: false,
                    createdAt: serverTimestamp(),
                  }
                );
                handleClose();
                setLoading(false);
              }
            })
            .catch((error) => {
              console.error("Error getting download URL:", error);
            });
        });
      } else {
        toast.error("There's no file!");
        setLoading(false);
      }
    };

    return (
      <>
        <Button className="mx-3" variant="primary " onClick={handleShow}>
          <h6 className="fw-bold text-white px-3 mb-0 py-1">Upload File</h6>
        </Button>{" "}
        <Modal size="lg" show={show} onHide={handleClose}>
          <Modal.Header className="bg-primary" closeButton>
            <Modal.Title>File Name</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <input
              onChange={(e) => setFile(e.target.files[0])}
              type="file"
              className="form-control"
              placeholder="Folder Name"
            />{" "}
          </Modal.Body>

          <Modal.Footer>
            <Button onClick={createFile}>Upload File</Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }

  const downloadFile = (file) => {
    console.log(file);
    const fileUrl = file;
    const link = document.createElement("a");
    link.href = fileUrl;
    link.target = "_blank";
    link.download = "downloaded_file";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  function DropdownAction({ storage }) {
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

    const handleDelete = async () => {
      const docMessage = doc(
        db,
        "storage",
        auth.currentUser.uid,
        "files",
        storage.id
      );
      deleteDoc(docMessage).then(() => toast.success("Successfully Deleted!"));
    };

    return (
      <Dropdown>
        <Dropdown.Toggle
          variant="secondary"
          id="dropdown-basic"
        ></Dropdown.Toggle>

        <Dropdown.Menu>
          <Dropdown.Item onClick={handleDelete}>Delete</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    );
  }

  useEffect(() => {
    if (auth.currentUser) {
      fetchData();
    }
  }, []);

  return (
    <LayoutUser>
      <div className="files-wrapper">
        <div className="row">
          <div className="col-lg-8">
            <div className="wrapper">
              <h2 className="fw-bold my-3 mx-2">
                Files Storage
                <FaFile className="mx-2" />
              </h2>
              <div
                className="bg-info mx-2 mb-3"
                style={{ width: "200px", height: "10px", borderRadius: 20 }}
              ></div>
            </div>
          </div>
          <div className="col-lg-4 flex">
            <AddFolder />
            <AddFile />
          </div>
          <div className="col-12 mx-3">
            <Breadcrumb>
              <Breadcrumb.Item onClick={fetchData}>Files</Breadcrumb.Item>

              <Breadcrumb.Item active>
                {currentFolder === "files" ? "" : currentFolder}
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
        </div>

        {loading && (
          <div className="flex flex-column">
            <h3>Uploading file...</h3>
            <BarLoader />
          </div>
        )}

        <div className="row mt-5">
          {storage &&
            storages.map((storage) => {
              return (
                <>
                  {storage.isFolder ? (
                    <div className="col-6 col-md-4 col-lg-3 flex flex-column">
                      <FaFolder
                        color="gray"
                        onClick={() => {
                          setCurrentFolder(storage.name);
                          fetchFolder(storage.name);
                        }}
                        size={70}
                      />{" "}
                      <div className="flex justify-content-around">
                        <div className="mx-3">{storage.name}</div>
                        <DropdownAction storage={storage} />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div
                        key={storage.id}
                        className="col-6 col-md-4 col-lg-3 flex flex-column"
                      >
                        <FaFile
                          color="gray"
                          onClick={() => downloadFile(storage.fileURL)}
                          size={70}
                        />
                        <div className="flex justify-content-around">
                          <div className="mx-3">{storage.fileName}</div>
                          <DropdownAction storage={storage} />
                        </div>
                      </div>
                    </>
                  )}
                </>
              );
            })}
        </div>
      </div>
    </LayoutUser>
  );
};

export default UserFiles;
