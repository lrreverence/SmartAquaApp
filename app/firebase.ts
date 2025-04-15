import { initializeApp } from "firebase/app";

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

export { app }; 