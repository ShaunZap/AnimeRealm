
const animeUrl = `../../pages/anime.html`;
const loginurl = `/`;
const notification = document.getElementById("notification");
const errorMessage = 'Incorrect username or password. Please try again.';
const registerError = 'Passwords don\'t match or fields are empty. Fill all fields.';
// const User = require('User');

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
        // console.log('clicked');
    });
    addKeyPressListener();
}

async function loginFunction() {
    const username = document.getElementById('username').value;
    const userPassword = document.getElementById('password').value;
    const response = await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: username, password: userPassword })
    });
    if (response.ok) {
        const token = await response.json(); // assuming server sends token in response
        localStorage.setItem('token', token);
        // console.log(token);
        history.replaceState(null, '', window.location.href = animeUrl);
    } else {
        showNotification(errorMessage);
    }
}

async function registerFuntion() {
    let userR = document.getElementById('usernameR').value;
    let passR = document.getElementById('passwordR').value;
    const email = document.getElementById('email').value;
    const confirmPass = document.getElementById('confirm-passwordR').value;

    // console.log('tempuser:',tempUser,'tempPass',tempPass);
    if (passR == confirmPass && passR !== ' ' && email !== '' && userR !== '' && confirmPass !== '') {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: userR, password: passR, email: email })
        });
        if (response.ok) 
            window.location.href = loginurl;
        else
            console.log("Something's wrong");
    }else{
        showNotification(registerError);
    }
}

function showNotification(message) {
    notification.textContent = message;
    notification.classList.add("show");
    setTimeout(() => {
        notification.classList.remove("show");
    }, 2500);
}
