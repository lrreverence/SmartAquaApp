// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getDatabase,ref,set, get, child } from "firebase/database";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBjddSds6NEawzwdB6o7um-vXISUgs9whM",
  authDomain: "smart-aqua-app.firebaseapp.com",
  databaseURL: "https://smart-aqua-app-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "smart-aqua-app",
  storageBucket: "smart-aqua-app.firebasestorage.app",
  messagingSenderId: "825234201175",
  appId: "1:825234201175:web:abf6ca1d2b8c3727746112"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const dbRef = ref(database);

export const saveToken = async (userId: string, token: string) => {
    const values = (await get(child(dbRef, `userTokens/${userId}`))).val()??{};
    const payload = { ...values, token};
    set(ref(database, `userTokens/${userId}`), payload);
}