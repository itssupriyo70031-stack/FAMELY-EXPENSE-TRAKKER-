import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Initialize Firestore with settings to avoid common preview environment issues
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Validate Connection to Firestore
import { doc, getDocFromServer, setLogLevel } from 'firebase/firestore';

async function testConnection() {
  try {
    // Only test if not on localhost to avoid unnecessary noise during rapid dev
    if (window.location.hostname !== 'localhost') {
      await getDocFromServer(doc(db, '_connection_test', 'status'));
      console.log("Firestore connected successfully.");
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Firestore connection failed: The client is offline.");
    }
  }
}
testConnection();

// Set log level to error to suppress transient transport warnings
setLogLevel('error');
