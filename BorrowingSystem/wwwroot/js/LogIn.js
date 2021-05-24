window.onload = function () {
    var userData = localStorage.getItem("UserData");
    if (userData) {
        userData = JSON.parse(userData);
        var jwt = parseJwt(userData.accessToken);
        if (jwt.exp >= new Date().getTime() / 1000) {
            refreshTokenAndRedirecToDashboard(userData.refreshToken);
        }
    }
    document.getElementById("form").addEventListener("submit", (event, context = this) => submitFormHandler(event, context));
}
function submitFormHandler(event, context) {
    event.preventDefault();
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;

    document.getElementById('logInLoader').style.display = "block";
    document.getElementById('submitLoginButton').style.display = "none";
    
    new Promise((resolve, reject) => {
        try {
            login(email, password, resolve);
        } catch (error) {
            reject({ status: -1, message: error.message });
        }
    }).then(data => {
        document.getElementById('logInLoader').style.visibility = "hidden";
        if (data.status == 200) {
            localStorage.setItem('UserData', data.body);
            window.location = "/dashboard";
        } else if (data.status == 403) {
            alert('Email or password is incorrect!');
            document.getElementById('logInLoader').style.display = "none";
            document.getElementById('submitLoginButton').style.display = "block";
            return -1;
        }else {
            console.log('Unkonw Error! : status code', data.status);
            alert('Unkonw Error!');
            document.getElementById('logInLoader').style.display = "none";
            document.getElementById('submitLoginButton').style.display = "block";
        }


    }).catch(error => {
        document.getElementById('logInLoader').style.display = "none";
        document.getElementById('submitLoginButton').style.display = "block";
        console.log('Error :', error.message);
        alert('Unkonw Error!');
    });
}

function refreshTokenAndRedirecToDashboard(refreshToken_) {
    new Promise((resolve, reject) => {
        try {
            refreshToken(refreshToken_,resolve);
        } catch (error) {
            reject({ status: -1, message: error.message });
        }
    }).then(data => {
        document.getElementById('logInLoader').style.visibility = "hidden";
        if (data.status == 200) {
            console.log('Success :', data.body);
            localStorage.setItem('UserData', data.body);
            window.location = "/dashboard";
        }else {
            console.log('Unkonw Error! : status code',data.status);
        }
    }).catch(error => {
        document.getElementById('logInLoader').style.visibility = "hidden";
        console.log('Error :', error.message);
    });
}
