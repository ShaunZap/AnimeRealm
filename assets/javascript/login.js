const defaultUser = 'admin';
const defaultPassword = 'admin';
const animeUrl = `../../pages/anime.html`;
const loginurl = `../../index.html`;
const notification = document.getElementById("notification");
const errorMessage = 'Incorrect username or password. Please try again.';
const registerError = 'Passwords don\'t match or fields are empty. Fill all fields.';

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

function loginFunction() {
    const username = document.getElementById('username').value;
    const userPassword = document.getElementById('password').value;
    const tempUser = sessionStorage.getItem('tempUser');
    const tempPass = sessionStorage.getItem('tempPass');
    console.log("username:",username,"password:",userPassword,'tempuser:',tempUser,'tempPass',tempPass);
    if ((username == tempUser && userPassword == tempPass) || (username == defaultUser && userPassword == defaultPassword)) {
        history.replaceState(null, '', window.location.href = animeUrl);
    } else {
        showNotification(errorMessage);
    }
}

function registerFuntion() {
    let userR = document.getElementById('usernameR').value;
    let passR = document.getElementById('passwordR').value;
    const email = document.getElementById('email').value;
    const confirmPass = document.getElementById('confirm-passwordR').value;

    // console.log('tempuser:',tempUser,'tempPass',tempPass);
    if (passR == confirmPass && passR !== ' ' && email !== '' && userR !== '' && confirmPass !== ''){
        // console.log('tempuser:',tempUser,'tempPass',tempPass);
        sessionStorage.setItem('tempUser', userR);
        sessionStorage.setItem('tempPass', passR);
        window.location.href = loginurl;
    }
    else{
        showNotification(registerError);
        userR = 'null';
        passR = 'null';
        sessionStorage.setItem('tempUser', userR);
        sessionStorage.setItem('tempPass', passR);
    }
}

function showNotification(message) {
    notification.textContent = message;
    notification.classList.add("show");
    setTimeout(() => {
        notification.classList.remove("show");
    }, 2500);
}
