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

    // Check if already logged in
    auth.onAuthStateChanged(function (user) {
        if (user) {
            // Check if admin
            if (user.email === ADMIN_EMAIL) {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'app.html';
            }
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

        auth.createUserWithEmailAndPassword(email, password)
            .then(function (result) {
                var uid = result.user.uid;
                // Save user profile
                return db.ref('users/' + uid).set({
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
                // Redirect handled by onAuthStateChanged
            })
            .catch(function (error) {
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
            default: return 'Something went wrong. Please try again.';
        }
    }
})();
