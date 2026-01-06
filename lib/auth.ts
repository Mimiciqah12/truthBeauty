import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

/* ===== REGISTER ===== */
export const registerUser = async (
  email: string,
  password: string,
  name: string
) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  const user = userCredential.user;

  // 🔥 SAVE PROFILE
  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    name,
    email,
    createdAt: new Date(),
  });

  return user;
};

/* ===== LOGIN ===== */
export const loginUser = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

/* ===== GET PROFILE ===== */
export const getUserProfile = async (uid: string) => {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
};

/* ===== RESET PASSWORD ===== */
export const resetPassword = async (email: string) => {
  return await sendPasswordResetEmail(auth, email);
};

/* ===== LOGOUT ===== */
export const logoutUser = async () => {
  return await signOut(auth);
};
