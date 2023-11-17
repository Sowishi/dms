import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase";
import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import { useState } from "react";
import { toast } from "react-toastify";

const CreateUser = () => {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  const handleSignup = async () => {
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      if (result) {
        const userDocRef = doc(db, "users", result.user.uid);
        await setDoc(userDocRef, {
          email: email,
          fullName: fullName,
          role: "user",
          phone: phone,
        });
        toast.success("Successfully Created User!");
      }

      // console.log("User signed up successfully!");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <>
      <h1>Create User</h1>
      <input
        placeholder="Name"
        type="text"
        onChange={(e) => setFullName(e.target.value)}
      />
      <input
        placeholder="Phone"
        type="text"
        onChange={(e) => setPhone(e.target.value)}
      />
      <input
        placeholder="Email"
        type="email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        placeholder="Password"
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleSignup}>create</button>
    </>
  );
};

export default CreateUser;
