// ChemBuddy Firebase Configuration
// Replace these values with your Firebase project config
const firebaseConfig = {
    apiKey: "AIzaSyD73Q-DnHPvnAQeXUyonyD7fdxYldta8mM",
    authDomain: "chembuddypilot.firebaseapp.com",
    databaseURL: "https://chembuddypilot-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "chembuddypilot",
    storageBucket: "chembuddypilot.firebasestorage.app",
    messagingSenderId: "206290400052",
    appId: "1:206290400052:web:91bad0b9a8a6ebb01c2b61",
    measurementId: "G-4G1CQ3JVY9"
};

// Admin email
const ADMIN_EMAIL = 'sundararaman.chintamani@gmail.com';

// Initialize Firebase
let app, auth, db;
function initFirebase() {
    if (!app) {
        app = firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.database();
    }
    return { app, auth, db };
}

// Helper: get current user uid
function getCurrentUid() {
    return auth && auth.currentUser ? auth.currentUser.uid : null;
}

// Helper: check if current user is admin
function isAdmin() {
    return auth && auth.currentUser && auth.currentUser.email === ADMIN_EMAIL;
}

// Helper: get database ref
function dbRef(path) {
    return db.ref(path);
}
