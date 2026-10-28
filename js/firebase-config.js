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

// Admin emails
const ADMIN_EMAILS = [
    'sundararaman.chintamani@gmail.com',
    'sundar@sundarspeaks.com',
    'richa@somaiya.edu',
    'pradnya.jadhav1@somaiya.edu',
    'chitra.b@somaiya.edu'
];

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
    return auth && auth.currentUser && ADMIN_EMAILS.includes(auth.currentUser.email);
}

// Helper: get database ref
function dbRef(path) {
    return db.ref(path);
}

// Invite-only sign-in. Admins paste the university's list of student emails
// into allowedEmails (key = lower-case email with '.' as ','), then switch on
// settings/inviteOnly. While it is off, anyone may register.
function emailKey(email) {
    return String(email || '').trim().toLowerCase().replace(/\./g, ',');
}

// Resolves true when this user may use the app. If the check itself cannot
// run (e.g. database rules not yet updated), it lets the user in — the
// database rules are what finally enforce the list.
function checkInvited(user) {
    if (ADMIN_EMAILS.includes(user.email)) return Promise.resolve(true);
    return db.ref('settings/inviteOnly').once('value').then(function (snap) {
        if (snap.val() !== true) return true;
        return db.ref('allowedEmails/' + emailKey(user.email)).once('value').then(function (s) {
            return s.exists();
        });
    }).catch(function (err) {
        console.warn('Invite check unavailable:', err.message);
        return true;
    });
}

var NOT_INVITED_MESSAGE = 'This email is not on your university\'s ChemBuddy list. Please register with the email your college gave, or contact your coordinator.';
