window.onload = function () {
    checkDisplayNavigationBar();
    document.getElementById('form').addEventListener('submit', (event) => submitFormHandler(event));
    var userData = JSON.parse(localStorage.getItem('UserData'));
    document.getElementById('userName').innerHTML = userData.fullName;
    document.getElementById('userEmail').innerHTML = userData.email;
    if (userData.phoneNumber != null) {
        document.getElementById('userPhoneNumber').innerHTML = userData.phoneNumber;
        document.getElementById('newPhoneNumber').value = userData.phoneNumber;
    } else {
        document.getElementById('userEmail').innerHTML = 'Not already assigned.';
    }
    if (userData.profileImage != null) {
        document.getElementById('userProfileImage').src = `/img/` + userData.profileImage;
    } else {
        document.getElementById('userProfileImage').src = `/img/user-profile.svg`;
    }
    document.getElementById('newFullName').value = userData.fullName;
    document.getElementById('newEmail').value = userData.email;

}

async function submitFormHandler(event) {
    event.preventDefault();
    document.getElementById('editProfileLoader').style.visibility = "visible";
    var newFullName = document.getElementById('newFullName').value;
    var newEmail = document.getElementById('newEmail').value;
    var newPhoneNumber = document.getElementById('newPhoneNumber').value;
    var newPassword = document.getElementById('newPassword').value;
    var confirmNewPassword = document.getElementById('confirmNewPassword').value;
    var oldPassword = document.getElementById('oldPassword').value;

    if (newPassword && (newPassword != confirmNewPassword)) {
        document.getElementById('editProfileLoader').style.visibility = "hidden";
        alert('Confirm new password not match new password');
        return -1;
    }

    var newProfileImage = await new Promise((resolve, reject) => {
        var tmpImageFile = document.getElementById('newProfileImage');
        var fileReader = new FileReader();
        fileReader.onload = () => {
            resolve(fileReader.result);
        };
        fileReader.onerror = (event) => {
            reject(fileReader.error);
        };
        fileReader.readAsDataURL(tmpImageFile.files[0]);
    });
    new Promise((resolve, reject) => {
        try {
            editProfile(newFullName, newEmail, newPhoneNumber, newProfileImage, newPassword, oldPassword , resolve);
        } catch (error) {
            reject({ status: -1, message: error.message });
        }
    }).then(data => {
        document.getElementById('editProfileLoader').style.visibility = "hidden";
        if (data.status == 204) {
            console.log('Success.');
        } else if (data.status == 401) {
            console.log(data.body, 'redirect to log in page.');
            window.location = "/user"
        } else if ( data.status == 403) {
            alert('Old password incorrect!');
            return;
        }else {
            console.log('Unknow Error : status code',data.status);
        }


    }).catch(error => {
        document.getElementById('editProfileLoader').style.visibility = "hidden";
        console.log('Error :', error.message);
    });
}