import { useParams } from "react-router";

const OutgoingView = () => {
  const { docID } = useParams();

  return (
    <>
      <h1>params {docID}</h1>
    </>
  );
};

export default OutgoingView;
