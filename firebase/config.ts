import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Konfigurasi ini diambil dari GoogleService-Info.plist Anda
const firebaseConfig = {
  apiKey: "AIzaSyCNRkEcfBkbACR2pWz4fafIfMrsmn3m-BI",
  authDomain: "travelio-d7a84.firebaseapp.com",
  projectId: "travelio-d7a84",
  storageBucket: "travelio-d7a84.appspot.com",
  messagingSenderId: "1039281929918",
  appId: "1:1039281929918:ios:72158c5de676e7ca2a68ef"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// Inisialisasi Cloud Firestore dan ekspor untuk digunakan di seluruh aplikasi
const db = getFirestore(app);

export { db };
