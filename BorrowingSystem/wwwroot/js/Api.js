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
        } else if (this.readyState == 4 && this.status == 401) {
            callback({ status: this.status, body: "Unauthoried!" });
        }
        else if (this.readyState == 4) {
            callback({ status: this.status, body: "Unknown Error." });
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

function editProfile(newFullName, newEmail, newPhoneNumber, newProfileImage, newPassword, oldPassword,callback) {
    ajax('/api/user/edit-profile', 'post', { newFullName: newFullName, newEmail: newEmail, newPhoneNumber: newPhoneNumber, newProfileImage: newProfileImage, newPassword: newPassword, oldPassword: oldPassword}, callback, true);
}

function createRoom(name,equipmentName,callback) {
    ajax('/api/room/create', 'post', { name: name, equipmentName: equipmentName}, callback, true);
}

function getAllRoom(callback) {
    ajax('/api/room/get-all', 'get',null,callback, true);
}

function deleteRoom(id, callback) {
    ajax('/api/room/delete', 'post', {id:id}, callback, true);
}

function updateRoom(id, name,equipmentName,callback) {
    ajax('/api/room/update', 'patch', { id: id, name: name, equipmentName: equipmentName}, callback, true);
}

function getAllBannedUser(callback) {
    ajax('/api/user/get-all-banned-user', 'get', null, callback, true);
}

function getAllNormalUser(callback) {
    ajax('/api/user/get-all-normal-user', 'get', null, callback, true);
}

function banUser(id,callback) {
    ajax('/api/user/ban-user', 'post', { id: id }, callback, true);
}

function unBanUser(id, callback) {
    ajax('/api/user/un-ban-user', 'post', { id: id }, callback, true);
}

function getAllEquipmentByRoom(id, callback) {
    ajax('/api/equipment/get-all-equipment-by-room', 'post', { id: id }, callback, true);
}

function createEquipment(roomId,name,serialNumber, callback) {
    ajax('/api/equipment/create', 'post', { roomId: roomId, name:name , serialNumber:serialNumber}, callback, true);
}

function deleteEquipment(id,callback) {
    ajax(`/api/equipment/delete?id=${id}`, 'delete', null , callback, true);
}

function patchEquipment(id,name,serialNumber, status ,callback) {
    ajax(`/api/equipment/patch`, 'patch', {id:id, name:name , serialNumber:serialNumber , status:status}, callback, true);
}