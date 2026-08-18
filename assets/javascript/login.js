
const animeUrl = `../../pages/anime.html`;
const loginurl = `/`;
const errorMessage = 'Incorrect email or password. Please try again.';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function setFieldError(errorId, message) {
    const errorEl = document.getElementById(errorId);
    if (!errorEl) return;
    const input = errorEl.previousElementSibling;
    if (input && input.matches('input')) {
        input.classList.toggle('input-invalid', !!message);
    }
    if (message) {
        errorEl.textContent = message;
        errorEl.classList.add('show');
    } else {
        errorEl.textContent = '';
        errorEl.classList.remove('show');
    }
}

function clearFieldError(errorId) {
    setFieldError(errorId, '');
}

function validateEmail(email) {
    if (!email) return 'Email is required.';
    if (!EMAIL_REGEX.test(email)) return 'Please enter a valid email address.';
    return '';
}

function validateUsername(username) {
    if (!username) return 'Username is required.';
    return '';
}

function validatePassword(password) {
    if (!password) return 'Password is required.';
    if (password.length < 6) return 'Password must be at least 6 characters long.';
    return '';
}

function validateConfirmPassword(password, confirm) {
    if (!confirm) return 'Please confirm your password.';
    if (password !== confirm) return 'Passwords don\'t match.';
    return '';
}

function addKeyPressListener() {
    document.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            if (window.location.pathname.includes("registration"))
                registerFuntion();
            else
                loginFunction();
        }
    });
}

function attachValidation(elementId, errorId, validator) {
    const input = document.getElementById(elementId);
    if (!input) return;
    input.addEventListener('blur', function () {
        setFieldError(errorId, validator(input.value.trim()));
    });
    input.addEventListener('input', function () {
        const message = validator(input.value.trim());
        if (!message) setFieldError(errorId, '');
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
        updateThemeIcon();
    }

    const loginEmail = document.getElementById('email');
    if (loginEmail) {
        attachValidation('email', 'login-email-error', validateEmail);
    }

    const regUsername = document.getElementById('usernameR');
    if (regUsername) {
        attachValidation('usernameR', 'usernameR-error', validateUsername);
        attachValidation('email', 'email-error', validateEmail);
        attachValidation('passwordR', 'passwordR-error', function (value) {
            return validatePassword(document.getElementById('passwordR').value);
        });
        attachValidation('confirm-passwordR', 'confirm-passwordR-error', function () {
            const pass = document.getElementById('passwordR').value;
            const confirm = document.getElementById('confirm-passwordR').value;
            return validateConfirmPassword(pass, confirm);
        });
    }
});

if (document.getElementById('login')) {
    const login = document.getElementById("login");
    login.addEventListener('click', function () {
        loginFunction();
    });
    addKeyPressListener();
}

if (document.getElementById('register')) {
    const register = document.getElementById('register');
    register.addEventListener('click', function () {
        registerFuntion();
    });
    addKeyPressListener();
}

async function loginFunction() {
    const email = document.getElementById('email').value.trim();
    const userPassword = document.getElementById('password').value;

    const emailError = validateEmail(email);
    const passwordError = userPassword ? '' : 'Password is required.';
    setFieldError('login-email-error', emailError);
    setFieldError('login-password-error', passwordError);
    if (emailError || passwordError) return;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email, password: userPassword })
        });
        if (response.ok) {
            const token = await response.json();
            localStorage.setItem('token', token);
            history.replaceState(null, '', window.location.href = animeUrl);
        } else {
            showToast(errorMessage, 'error');
        }
    } catch (err) {
        showToast('Cannot reach the server. Is it running?', 'error');
    }
}

async function registerFuntion() {
    let userR = document.getElementById('usernameR').value.trim();
    let passR = document.getElementById('passwordR').value;
    const email = document.getElementById('email').value.trim();
    const confirmPass = document.getElementById('confirm-passwordR').value;

    const usernameError = validateUsername(userR);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(passR);
    const confirmError = validateConfirmPassword(passR, confirmPass);

    setFieldError('usernameR-error', usernameError);
    setFieldError('email-error', emailError);
    setFieldError('passwordR-error', passwordError);
    setFieldError('confirm-passwordR-error', confirmError);

    if (usernameError || emailError || passwordError || confirmError) {
        if (passwordError) showToast(passwordError, 'warn');
        return;
    }

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: userR, password: passR, email: email })
        });
        if (response.ok) {
            window.location.href = loginurl;
        } else {
            let msg = 'Registration failed. Please try again.';
            try {
                const data = await response.json();
                if (data && data.error) msg = data.error;
            } catch (_) {}
            showToast(msg, 'error');
        }
    } catch (err) {
        showToast('Cannot reach the server. Is it running?', 'error');
    }
}
