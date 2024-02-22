const login = document.getElementById("login");
const tempUser = 'shaun';
const tempPass = 'shaun@123';
const url = `../../pages/anime.html`;
const notification = document.getElementById("notification");
const errorMessage = 'Incorrect username or password. Please try again.';

login.addEventListener('click', function(){
    loginFunction();
});

document.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        loginFunction();
    }
});

function loginFunction() {
    const username = document.getElementById('username').value;
    const userPassword = document.getElementById('password').value;
    if(username == tempUser && userPassword == tempPass) {
        history.replaceState(null, '', window.location.href = url);
    } else {
        showNotification(errorMessage);
    }
}

function showNotification(message) {
    notification.textContent = message;
    notification.classList.add("show");
    setTimeout(() => {
        notification.classList.remove("show");
    }, 2500);
}
