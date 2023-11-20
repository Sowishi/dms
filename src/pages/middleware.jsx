import { useEffect } from "react";
import { auth } from "../../firebase";
import { useNavigate } from "react-router";

const Middleware = ({ children, admin }) => {
  const isLogin = auth;
  const navigation = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      if (!isLogin.currentUser && !admin) {
        navigation("/");
      }
    }, 1000);
  });

  return <>{children}</>;
};

export default Middleware;
