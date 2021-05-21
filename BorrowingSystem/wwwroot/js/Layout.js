window.onload = function () {
    var userData = JSON.parse(localStorage.getItem('UserData'));
    if (userData.role == 'admin') {
        document.getElementById('myBorrowNavigation').style.display = 'none';
        document.getElementById('managementNavigation').style.display = 'block';
    } else {
        document.getElementById('myBorrowNavigation').style.display = 'block';
        document.getElementById('managementNavigation').style.display = 'none';
    }
}

function logOutHandler(event) {
    event.preventDefault();
    document.getElementById('logOutLoader').style.visibility = "visible";
    new Promise((resolve, reject) => {
        try {
            logout(resolve);
        } catch (error) {
            reject({ status: -1, message: error.message });
        }
    }).then(data => {
        document.getElementById('logOutLoader').style.visibility = "hidden";
        if (data.status == 204) {
            console.log('Success :', data.body);
            localStorage.removeItem('UserData');
            window.location = "/user";
        } else {
            console.log('Error!');
        }
    }).catch(error => {
        document.getElementById('logOutLoader').style.visibility = "hidden";
        console.log('Error :', error.message);
    });
}