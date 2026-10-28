// ChemBuddy - Authentication Module

(function () {
    'use strict';

    // Initialize Firebase
    initFirebase();

    // DOM Elements
    const tabs = document.querySelectorAll('.auth-tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginError = document.getElementById('login-error');
    const registerError = document.getElementById('register-error');

    // Set while a new account's profile is being saved. Firebase signs the user
    // in as soon as the account is created, which fires onAuthStateChanged —
    // redirecting then aborts the profile write, leaving the student with no
    // name (shown as "Student" on the leaderboard). Registration redirects
    // itself once the profile is saved.
    var registering = false;

    function redirectFor(user) {
        if (ADMIN_EMAILS.includes(user.email)) {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'app.html';
        }
    }

    // Sent back here by app.html when the email is not on the invite list
    if (window.location.hash === '#not-invited') {
        loginError.textContent = NOT_INVITED_MESSAGE;
        loginError.classList.add('show');
        history.replaceState(null, '', window.location.pathname);
    }

    // Check if already logged in
    auth.onAuthStateChanged(function (user) {
        if (user && !registering) {
            redirectFor(user);
        }
    });

    // Tab switching
    tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            const target = this.dataset.tab;
            tabs.forEach(function (t) { t.classList.remove('active'); });
            this.classList.add('active');

            if (target === 'login') {
                loginForm.classList.remove('hidden');
                registerForm.classList.add('hidden');
            } else {
                loginForm.classList.add('hidden');
                registerForm.classList.remove('hidden');
            }
            // Clear errors
            loginError.classList.remove('show');
            registerError.classList.remove('show');
        });
    });

    // Forgot password
    document.getElementById('forgot-password').addEventListener('click', function (e) {
        e.preventDefault();
        var email = document.getElementById('login-email').value.trim();
        if (!email) {
            loginError.textContent = 'Enter your email above, then click Forgot password.';
            loginError.classList.add('show');
            return;
        }
        auth.sendPasswordResetEmail(email)
            .then(function () {
                loginError.textContent = 'Password reset link sent to ' + email + '. Check your inbox.';
                loginError.classList.add('show');
                loginError.style.color = '#27ae60';
            })
            .catch(function (error) {
                loginError.textContent = friendlyError(error.code);
                loginError.classList.add('show');
                loginError.style.color = '';
            });
    });

    // Login
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var email = document.getElementById('login-email').value.trim();
        var password = document.getElementById('login-password').value;
        var btn = loginForm.querySelector('.auth-submit');

        loginError.classList.remove('show');
        btn.disabled = true;
        btn.textContent = 'Logging in...';

        auth.signInWithEmailAndPassword(email, password)
            .then(function (result) {
                // Update last active
                var uid = result.user.uid;
                db.ref('users/' + uid + '/lastActiveAt').set(Date.now());
                // Redirect handled by onAuthStateChanged
            })
            .catch(function (error) {
                loginError.textContent = friendlyError(error.code);
                loginError.classList.add('show');
                btn.disabled = false;
                btn.textContent = 'Login';
            });
    });

    // Register
    registerForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var name = document.getElementById('reg-name').value.trim();
        var email = document.getElementById('reg-email').value.trim();
        var password = document.getElementById('reg-password').value;
        var college = document.getElementById('reg-college').value.trim();
        var branch = document.getElementById('reg-branch').value;
        var btn = registerForm.querySelector('.auth-submit');

        registerError.classList.remove('show');

        if (!name) {
            registerError.textContent = 'Please enter your name.';
            registerError.classList.add('show');
            return;
        }

        btn.disabled = true;
        btn.textContent = 'Creating account...';
        registering = true;

        var newUser = null;
        auth.createUserWithEmailAndPassword(email, password)
            .then(function (result) {
                newUser = result.user;
                return checkInvited(newUser);
            })
            .then(function (invited) {
                if (!invited) {
                    // Remove the account just created so the email can be used once listed
                    var u = newUser;
                    newUser = null;
                    return u.delete().catch(function () { return auth.signOut(); }).then(function () {
                        throw { code: 'not-invited' };
                    });
                }
                // Save user profile
                return db.ref('users/' + newUser.uid).set({
                    name: name,
                    email: email,
                    college: college || '',
                    branch: branch || '',
                    registeredAt: Date.now(),
                    lastActiveAt: Date.now(),
                    role: 'student'
                });
            })
            .then(function () {
                // Profile saved — now it is safe to leave this page
                redirectFor(newUser);
            })
            .catch(function (error) {
                registering = false;
                // Account created but profile not saved: the app will ask for the name
                if (newUser) { redirectFor(newUser); return; }
                registerError.textContent = friendlyError(error.code);
                registerError.classList.add('show');
                btn.disabled = false;
                btn.textContent = 'Create Account';
            });
    });

    function friendlyError(code) {
        switch (code) {
            case 'auth/email-already-in-use': return 'This email is already registered. Try logging in.';
            case 'auth/invalid-email': return 'Please enter a valid email address.';
            case 'auth/weak-password': return 'Password must be at least 6 characters.';
            case 'auth/user-not-found': return 'No account found with this email.';
            case 'auth/wrong-password': return 'Incorrect password. Please try again.';
            case 'auth/invalid-credential': return 'Invalid email or password. Please try again.';
            case 'auth/too-many-requests': return 'Too many attempts. Please wait and try again.';
            case 'not-invited': return NOT_INVITED_MESSAGE;
            default: return 'Something went wrong. Please try again.';
        }
    }
})();
