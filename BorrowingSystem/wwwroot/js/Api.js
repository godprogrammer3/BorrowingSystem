function ajax(uri, method, body, callback, isNeedAuthorisation = false) {
    var xmlhttp; 
    if (window.ActiveXObject) {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    } else {
        xmlhttp = new XMLHttpRequest();
    }
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && (this.status == 200 || this.status == 204)) {
            callback({ status: this.status, body: xmlhttp.responseText });
        } else if (this.readyState == 4 ) {
            callback({ status:-1, body: "Unknown Error." });
        }
    };
    xmlhttp.open(method, uri, true);
    xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    if (isNeedAuthorisation) {
        var userData = localStorage.getItem("UserData");
        if (!userData) {
            throw new UnauthorizedException('Unauthorized!');
        }
        userData = JSON.parse(userData);
        xmlhttp.setRequestHeader('Authorization', 'Bearer ' + userData.accessToken);
    }
    if (body) {
        console.log('body :', JSON.stringify(body));
        xmlhttp.send(JSON.stringify(body));
    } else {
       xmlhttp.send();
    }
}
function register(email, password, fullName,callback) {
    ajax('/api/user/register', 'post', { email: email, password: password, fullName: fullName }, callback);
}
function login(email, password,callback) {
    ajax('/api/user/login', 'post', { email: email, password: password}, callback);
}

function refreshToken(refreshToken, callback) {
    ajax('/api/user/refresh-token', 'post', { refreshToken:refreshToken}, callback,true);
}

function logout(callback) {
    ajax('/api/user/logout', 'post', null, callback, true);
}
function editProfile(fullName, email, phoneNumber, callback) {
    ajax('/api/user/edit-profile', 'post', { fullName: fullName, email: email, phoneNumber: phoneNumber }, callback, true);
}