import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAbU4an91pIr66g1AH1MGGe6Vou7dmpylE",
  authDomain: "farm-to-market-adf65.firebaseapp.com",
  databaseURL: "https://farm-to-market-adf65-default-rtdb.firebaseio.com",
  projectId: "farm-to-market-adf65",
  storageBucket: "farm-to-market-adf65.firebasestorage.app",
  messagingSenderId: "629145445980",
  appId: "1:629145445980:web:e0a4ba259fd7607879e899",
  measurementId: "G-1KT110EV74"
};

const app  = initializeApp(firebaseConfig);

// Analytics (non-blocking)
let analytics;
try { analytics = getAnalytics(app); } catch (_) {}

const auth = getAuth(app);

// Firestore with persistent local cache — works offline and loads instantly from cache
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

const rtdb    = getDatabase(app);
const storage = getStorage(app);

export { app, analytics, auth, db, rtdb, storage };
