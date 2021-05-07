window.onload = function () {
    document.getElementById('logOut').addEventListener('click', (event) => logOutHandler(event));
}

function logOutHandler(event) {
    event.preventDefault();
    new Promise((resolve, reject) => {
        try {
            logout(resolve);
        } catch (error) {
            reject({ status: -1, message: error.message });
        }
    }).then(data => {
        document.getElementById('loader').style.visibility = "hidden";
        if (data.status == 204) {
            console.log('Success :', data.body);
            localStorage.removeItem('UserData');
            window.location = "/user";
        } else {
            console.log('Error!');
        }
    }).catch(error => {
        document.getElementById('loader').style.visibility = "hidden";
        console.log('Error :', error.message);
    });
}