import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore, collection, addDoc, query, where, getDocs, deleteDoc, doc, orderBy } from "firebase/firestore";
import { SavedLayout } from "../types";

const firebaseConfig = {
  apiKey: "AIzaSyDgJ7vbCTBzEB9gHIomjjONEu4uWPYd6os",
  authDomain: "studio-1085614170-f2f27.firebaseapp.com",
  projectId: "studio-1085614170-f2f27",
  storageBucket: "studio-1085614170-f2f27.firebasestorage.app",
  messagingSenderId: "1067737547108",
  appId: "1:1067737547108:web:be12e2ea5b1cea63a5ba71"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error("Error signing in with Google:", error);
    if (error.code === 'auth/unauthorized-domain') {
      const domain = window.location.hostname;
      alert(`Firebase Auth Error: Domain not authorized.\n\nPlease add "${domain}" to your Firebase Console -> Authentication -> Settings -> Authorized Domains.`);
    }
    throw error;
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
  }
};

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const saveLayout = async (userId: string, name: string, html: string) => {
  try {
    const docRef = await addDoc(collection(db, "layouts"), {
      userId,
      name,
      html,
      createdAt: Date.now()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error saving layout", error);
    throw error;
  }
};

export const getUserLayouts = async (userId: string): Promise<SavedLayout[]> => {
  try {
    const q = query(
      collection(db, "layouts"), 
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    const layouts: SavedLayout[] = [];
    querySnapshot.forEach((doc) => {
      layouts.push({ id: doc.id, ...doc.data() } as SavedLayout);
    });
    return layouts;
  } catch (error) {
    console.error("Error getting layouts", error);
    return [];
  }
};

export const deleteLayout = async (layoutId: string) => {
  try {
    await deleteDoc(doc(db, "layouts", layoutId));
  } catch (error) {
    console.error("Error deleting layout", error);
    throw error;
  }
};