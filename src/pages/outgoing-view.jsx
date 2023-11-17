import { useParams } from "react-router";
import Layout from "../layout/layout";

const OutgoingView = () => {
  const { docID } = useParams();

  return (
    <>
      <Layout>
        <h1>params {docID}</h1>
      </Layout>
    </>
  );
};

export default OutgoingView;
