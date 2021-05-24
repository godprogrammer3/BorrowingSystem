window.onload = function () {
    checkDisplayNavigationBar();
    document.getElementById('logOut').addEventListener('click', (event) => logOutHandler(event));
    initialRooms();
    document.getElementById('laboratory').addEventListener('click', function (event) {
        event.preventDefault();
        document.getElementById('blacklist').style.color = 'rgba(60, 60, 67, 0.6)';


        document.getElementById('laboratory').style.color = '#9D0042';
        initialRooms();
    });
    document.getElementById('blacklist').addEventListener('click', function (event) {
        event.preventDefault();
        document.getElementById('blacklist').style.color = '#9D0042';
        document.getElementById('laboratory').style.color = 'rgba(60, 60, 67, 0.6)';

        initialBlacklist();
    });
}

function initialRooms(event) {
    if (event) {
        event.preventDefault();
    }
    document.getElementById('loadingTab').style.display = 'block';
    document.getElementById('laboratoryTab').style.display = 'none';
    document.getElementById('blacklistTab').style.display = 'none';
    new Promise((resolve, reject) => {
        try {
            getAllRoom(resolve);
        } catch (error) {
            reject({ status: -1, message: error.message });
        }
    }).then(data => {
        if (data.status == 200) {
            var rooms = JSON.parse(data.body);
            if (rooms.length > 0) {
                let insideContent = `<table>
                 <tr>
                     <th>Name</th>
                     <th>Equipment Name</th>
                     <th>Date Modified</th>                     
                     <th>Create By</th>
                     <th>Action</th>
                 </tr>
                `;
                rooms.forEach((room) => {
                    var bits = room.dateModified.split(/\D/);
                    var date = new Date(bits[0], --bits[1], bits[2], bits[3], bits[4], bits[5]);
                    insideContent += `
                     <tr >
                       <td onclick="window.location = '/management/room?id=${room.id}&name=${encodeURI(room.name)}'">${room.name}</td>
                       <td>${room.equipmentName}</td>
                       <td>${date.toLocaleString()}</td>
                       <td>${room.createBy}</td>
                       <td>
                            <span class="material-icons-outlined" onclick="updateRoomHandler({id:${room.id},name:'${room.name}',equipmentName: '${room.equipmentName}'})">
                                edit
                            </span>
                            <span class="material-icons-outlined" onclick="deleteRoomHandler({id:${room.id},name:'${room.name}'});">
                                delete
                            </span>
                       </td>
                     </tr>
                    `;
                });
                insideContent += `<tr><td></td><td></td><td></td>
                <td>
                     <button onclick="createRoomHandler(event);">New Laboratory</button>
                </td>
                </tr>`;
                insideContent += '</table>';
                document.getElementById('loadingTab').style.display = 'none';
                document.getElementById('laboratoryTab').style.display = 'block';
                document.getElementById('laboratoryTab').innerHTML = insideContent;

            } else {
                let insideContent = ` <p>You don't have laboratory</p>
                <button onclick="createRoomHandler(event);">New Laboratory</button>`;
                document.getElementById('loadingTab').style.display = 'none';
                document.getElementById('laboratoryTab').innerHTML = insideContent;
                document.getElementById('laboratoryTab').style.display = 'block';
            }
        } else if (data.status == 401) {
            console.log('Unauthorized! : status code', data.status);
            console.log('Redirecting to log in page.');
            window.location = '/user';
        } else {          
            console.log('Unkonw Error! : status code', data.status);
            document.getElementById('loadingTab').style.display = 'none';
        }
    })
        .catch(error => {
            console.log('Error :', error.message);
            document.getElementById('loadingTab').style.display = 'none';
        });
}

function postPopupProcess() {
    document.getElementById('onSuccessPopup').style.display = 'none';
    document.getElementById('popup').style.display = 'none';
    afterPostPupupProcess();
};

var afterPostPupupProcess = ()=>{
    console.log('postPupupProcess is empty function');
}

function createRoomHandler() {
    document.getElementById('headerOnInitialPopupContent').innerHTML = `<h3 class="popup-header">New Laboratory</h3>`;
    document.getElementById('bodyOnInitialPopupContent').innerHTML = `
    <div class="center-row-flex">
        <form id="popupForm" onsubmit="confirmCreateRoom(event);" style="text-align:center;">
            <input type="text" name="roomName" id="roomName" value="" placeholder="Enter room's name..."   class="popup-input" required />
            <input type="text" name="equipmentName" id="equipmentName" value="" placeholder="Enter equipment's name..."   class="popup-input" required />
            <button id="popupFormButton" type="submit" style="display:none;" ></button>
        </form>
    </div>
`;
    document.getElementById('confirmButtonOnInitialPopupContent').innerHTML = 'Create';
    document.getElementById('confirmButtonOnInitialPopupContent').onclick = function (event) {
        document.getElementById("popupFormButton").click();
    };
    document.getElementById('onInitialPopup').style.display = 'block';
    document.getElementById('popup').style.display = 'block';
}

function confirmCreateRoom(event) {
    if (event) {
        event.preventDefault();
        console.log('Prevent Default!!!');
    }
    console.log(event);
    var name = document.getElementById('roomName').value;
    var equipmentName = document.getElementById('equipmentName').value;
    document.getElementById('onInitialPopup').style.display = 'none';
    document.getElementById('onLoadingPopup').style.display = 'block';
    new Promise((resolve, reject) => {
        try {
            createRoom(name,equipmentName, resolve);
        } catch (error) {
            reject({ status: -1, message: error.message });
        }
    }).then(data => {
        if (data.status == 204) {
            document.getElementById('onLoadingPopup').style.display = 'none';
            document.getElementById('onSuccessPopup').style.display = 'block';
            document.getElementById('onErrorPopup').style.display = 'none';
            afterPostPupupProcess = confirmRoomSuccessHandler;
        } else if (data.status == 401) {
            console.log('Unauthorized! : status code', data.status);
            console.log('Redirecting to log in page.');
            window.location = '/user';
        }else {
            console.log('Unkonw Error! : status code', data.status);
            document.getElementById('onLoadingPopup').style.display = 'none';
            document.getElementById('onErrorPopup').style.display = 'block';
        }
    }).catch(error => {
        console.log('Error :', error.message);
        document.getElementById('onLoadingPopup').style.display = 'none';
        document.getElementById('onErrorPopup').style.display = 'block';
    });
}

function confirmRoomSuccessHandler(event) {
    document.getElementById('laboratoryTab').style.display = 'none';
    document.getElementById('loadingTab').style.display = 'block';
    initialRooms();
}

function deleteRoomHandler (room){
    document.getElementById('headerOnInitialPopupContent').innerHTML = `<h3>Remove <span class="error-text">${room.name}</span> Laboratory?</h3>`;
    document.getElementById('bodyOnInitialPopupContent').innerHTML = ``;
    document.getElementById('confirmButtonOnInitialPopupContent').innerHTML = 'Remove';
    document.getElementById('confirmButtonOnInitialPopupContent').onclick = function (event) {
        confirmDeleteRoom(room);
    };
    document.getElementById('onInitialPopup').style.display = 'block';
    document.getElementById('popup').style.display = 'block';
}

function confirmDeleteRoom(room) {
    document.getElementById('onInitialPopup').style.display = 'none';
    document.getElementById('onLoadingPopup').style.display = 'block';
    new Promise((resolve, reject) => {
        try {
            deleteRoom(room.id, resolve);
        } catch (error) {
            reject({ status: -1, message: error.message });
        }
    }).then(data => {
        if (data.status == 204) {
            document.getElementById('onLoadingPopup').style.display = 'none';
            document.getElementById('onSuccessPopup').style.display = 'block';
            afterPostPupupProcess = confirmRoomSuccessHandler;
        } else if (data.status == 401) {
            console.log('Unauthorized! : status code', data.status);
            console.log('Redirecting to log in page.');
            window.location = '/user';
        } else {
            console.log('Unkonw Error! : status code', data.status);
        }
    }).catch(error => {
        console.log('Error :', error.message);
        document.getElementById('onLoadingPopup').style.display = 'none';
        document.getElementById('onErrorPopup').style.display = 'block';
    });
}

function updateRoomHandler(room) {
    document.getElementById('headerOnInitialPopupContent').innerHTML = `<h3>Edit name</h3>`;
    document.getElementById('bodyOnInitialPopupContent').innerHTML = `
    <div class="center-row-flex">
        <form id="popupForm" " style="text-align:center;">
        <input type="text" name="roomName" id="roomName" value="${room.name}" placeholder="Enter room's name..."  class="popup-input" required />
        <input type="text" name="equipmentName" id="equipmentName" value="${room.equipmentName}" placeholder="Enter equipment's name..." class="popup-input" required />
        <button id="popupFormButton" type="submit" style="display:none;" ></button>
      </form>
    </div>
    `;
    document.getElementById('confirmButtonOnInitialPopupContent').innerHTML = 'Edit';
    document.getElementById('popupForm').onsubmit = function () {
            confirmUpdateRoom(room);
    }
    document.getElementById('confirmButtonOnInitialPopupContent').onclick = function (event) {
        document.getElementById("popupFormButton").click();
    };
    document.getElementById('onInitialPopup').style.display = 'block';
    document.getElementById('popup').style.display = 'block';
}

function confirmUpdateRoom(room) {
    document.getElementById('onInitialPopup').style.display = 'none';
    document.getElementById('onLoadingPopup').style.display = 'block';
    var newName = document.getElementById('roomName').value;
    var newEquipmentName = document.getElementById('equipmentName').value;
    new Promise((resolve, reject) => {
        try {
            updateRoom(room.id, newName, newEquipmentName,resolve);
        } catch (error) {
            reject({ status: -1, message: error.message });
        }
    }).then(data => {
        if (data.status == 204) {
            document.getElementById('onLoadingPopup').style.display = 'none';
            document.getElementById('onSuccessPopup').style.display = 'block';
            afterPostPupupProcess = confirmRoomSuccessHandler;
        } else if (data.status == 401) {
            console.log('Unauthorized! : status code', data.status);
            console.log('Redirecting to log in page.');
            window.location = '/user';
        } else {
            console.log('Unkonw Error! : status code', data.status);
        }
    }).catch(error => {
        console.log('Error :', error.message);
        document.getElementById('onLoadingPopup').style.display = 'none';
        document.getElementById('onErrorPopup').style.display = 'block';
    });
}

var globalBannedUsers = [];
function initialBlacklist(event) {
    if (event) {
        event.preventDefault();
    }
    document.getElementById('loadingTab').style.display = 'block';
    document.getElementById('laboratoryTab').style.display = 'none';
    document.getElementById('blacklistTab').style.display = 'none';
    document.getElementById('searchBlacklistTab').style.display = 'none';
    new Promise((resolve, reject) => {
        try {
            getAllBannedUser(resolve);
        } catch (error) {
            reject({ status: -1, message: error.message });
        }
    }).then(data => {
        if (data.status == 200) {
            var users = JSON.parse(data.body);
            globalBannedUsers = users;
            if (users.length > 0) {
                let insideContent = `<table>
                 <tr>
                     <th>Name</th>
                     <th>Email</th>                     
                     <th>Phone Number</th>
                     <th>Action</th>
                     <th>
                        <span class="material-icons" id="searchIcon" onclick="searchBlacklistTabHandler(event);">
                                search
                            </span>
                          </th>
                     </tr>
                `;
                users.forEach((user) => {
                    insideContent += `
                     <tr>
                       <td>
                        <span><img src="img/${user.profileImage ?? 'user-profile.svg'}" width="50px" /></span>
                        <span>${user.fullName}</span>
                        </td>
                       <td>${user.email}</td>
                       <td>${user.phoneNumber}</td>
                       <td>
                            <span class="material-icons-outlined" onclick="unBanUserHandler(${user.id});">
                                delete
                            </span>
                       </td>
                     </tr>
                    `;
                });
                insideContent += `<tr><td></td><td></td><td></td>
                <td>
                     <button onclick="addBannedUserHandler(event);">Add people to blacklist</button>
                </td>
                </tr>`;
                insideContent += '</table>';
                document.getElementById('loadingTab').style.display = 'none';
                document.getElementById('blacklistTab').style.display = 'block';
                document.getElementById('blacklistTab').innerHTML = insideContent;

            } else {
                let insideContent = ` <p>You don't have any blacklist user.</p>
                <button onclick="addBannedUserHandler(event);">Add people to blacklist</button>`;
                document.getElementById('loadingTab').style.display = 'none';
                document.getElementById('blacklistTab').innerHTML = insideContent;
                document.getElementById('blacklistTab').style.display = 'block';
            }
        } else if (data.status == 401) {
            console.log('Unauthorized! : status code', data.status);
            console.log('Redirecting to log in page.');
            window.location = '/user';
        } else {
            console.log('Unkonw Error! : status code', data.status);
            document.getElementById('loadingTab').style.display = 'none';
        }
    })
        .catch(error => {
            console.log('Error :', error.message);
            document.getElementById('loadingTab').style.display = 'none';
        });
}

var globalNormalUsers = [];
function addBannedUserHandler() {
    document.getElementById('onLoadingBlacklistPopup').style.display = 'block';
    document.getElementById('onSuccessBlacklistPopup').style.display = 'none';
    document.getElementById('onErrorBlacklistPopup').style.display = 'none';
    document.getElementById('blacklistPopup').style.display = 'block';
    new Promise((resolve, reject) => {
        try {
            getAllNormalUser(resolve);
        } catch (error) {
            reject({ status: -1, message: error.message });
        }
    }).then(data => {
        if (data.status == 200) {
            var users = JSON.parse(data.body);
            globalNormalUsers = users;
            if (users.length > 0) {
                let insideContent = `<ul style="list-style-type: none;" class="popup-ul" >`;
                users.forEach((user) => {
                    insideContent += `
                     <li>
                       <span>
                        <img src="img/${user.profileImage??'user-profile.svg'}" class="image-profile-li"/>
                       </span>
                       <span class="username-li" >${user.fullName}</span>
                       <span class="material-icons action-li" onclick="banUserHandler(${user.id})">
                            person_add_alt_1
                       </span>
                     </li>
                    `;
                });
                insideContent += '</ul>';
                document.getElementById('onLoadingBlacklistPopup').style.display = 'none';
                document.getElementById('onSuccessBlcklistPopupContent').innerHTML = insideContent;
                document.getElementById('onSuccessBlacklistPopup').style.display = 'block';
                document.getElementById('searchNameOrEmailPopup').addEventListener('input', updateOnSuccessBlcklistPopupContent)

            } else {
                let insideContent = ` <h4>Dont have any normal user.</h4>
                `;
                document.getElementById('onLoadingBlacklistPopup').style.display = 'none';
                document.getElementById('onSuccessBlcklistPopupContent').innerHTML = insideContent;
                document.getElementById('onSuccessBlacklistPopup').style.display = 'block';
            }
        } else if (data.status == 401) {
            console.log('Unauthorized! : status code', data.status);
            console.log('Redirecting to log in page.');
            window.location = '/user';
        } else {
            console.log('Unkonw Error! : status code', data.status);
            document.getElementById('onLoadingBlacklistPopup').style.display = 'none';
            document.getElementById('onErrorBlacklistPopup').style.display = 'block';
        }
    })
        .catch(error => {
            console.log('Error :', error.message);
            document.getElementById('onLoadingBlacklistPopup').style.display = 'none';
            document.getElementById('onErrorBlacklistPopup').style.display = 'block';
        });
}

function updateOnSuccessBlcklistPopupContent(event) {
    var searchEmailOrName = event.target.value;
    console.log(searchEmailOrName);
    if (searchEmailOrName) {
        let updateNormalUser = globalNormalUsers.filter((user) => {
            return user.email.toLowerCase().includes(searchEmailOrName.toLowerCase()) || user.fullName.toLowerCase().includes(searchEmailOrName.toLowerCase());
        });
        if (updateNormalUser.length > 0) {
            let insideContent = `<ul style="list-style-type: none;" class="popup-ul" > `;
            updateNormalUser.forEach((user) => {
                insideContent += `
                     <li>
                       <span>
                        <img src="img/${user.profileImage ?? 'user-profile.svg'}"  class="image-profile-li"  />
                       </span>
                       <span class="username-li" >${user.fullName}</span>
                       <span class="material-icons action-li" onclick="banUserHandler(${user.id})">
                            person_add_alt_1
                       </span>
                     </li>
                    `;
            });
            insideContent += '</ul>';
            document.getElementById('onSuccessBlcklistPopupContent').innerHTML = insideContent;
        } else {
            let insideContent = `<h4>Not found any users.</h4>`;
            document.getElementById('onSuccessBlcklistPopupContent').innerHTML = insideContent;
        }
    } else {
        if (globalNormalUsers.length > 0) {
            let insideContent = `<ul style="list-style-type: none;" class="popup-ul" >`;
            globalNormalUsers.forEach((user) => {
                insideContent += `
                                <li>
                                <span>
                                <img src="img/${user.profileImage ?? 'user-profile.svg'}"  class="image-profile-li"  />
                                </span>
                                <span class="username-li">${user.fullName}</span>
                                <span class="material-icons action-li "  onclick="banUserHandler(${user.id})">
                                    person_add_alt_1
                                </span>
                                </li>
                            `;
            });
            insideContent += '</ul>';
            document.getElementById('onSuccessBlcklistPopupContent').innerHTML = insideContent;
        } else {
            let insideContent = ` <h4>Dont have any normal user.</h4>
                `;
            document.getElementById('onSuccessBlcklistPopupContent').innerHTML = insideContent;
        }
       
    }
    
}

async function banUserHandler(id) {
    document.getElementById('onLoadingBlacklistPopup').style.display = 'block';
    document.getElementById('onSuccessBlacklistPopup').style.display = 'none';
    document.getElementById('onErrorBlacklistPopup').style.display = 'none';
    var result = await new Promise((resolve, reject) => {
        try {
            banUser(id, resolve);
        } catch (error) {
            console.log('Error! :', error.message);
            reject(null);
        }
    });
    
    if (result?.status == 204) {
        globalNormalUsers = globalNormalUsers.filter(( user ) => {
            return user.id != id;
        });
        let insideContent = '';
        if (globalNormalUsers.length > 0) {
            insideContent += `<ul style="list-style-type: none;" class="popup-ul" >`;
            globalNormalUsers.forEach((user) => {
                insideContent += `
                                <li>
                                <span>
                                <img src="img/${user.profileImage ?? 'user-profile.svg'}" class="image-profile-li"/>
                                </span>
                                <span class="username-li">${user.fullName}</span>
                                <span class="material-icons action-li" onclick="banUserHandler(${user.id})">
                                    person_add_alt_1
                                </span>
                                </li>
                            `;
            });
            insideContent += '<ul>';
        } else {
            insideContent = ` <h4>Dont have any normal user.</h4>
             `;
           
        }
        document.getElementById('onSuccessBlcklistPopupContent').innerHTML = insideContent;
        document.getElementById('onLoadingBlacklistPopup').style.display = 'none';
        document.getElementById('onSuccessBlacklistPopup').style.display = 'block';
        document.getElementById('onErrorBlacklistPopup').style.display = 'none';
    } else if ( result?.status == 401 ) {
        console.log('Unauthorized! : status code', result.status);
        console.log('Redirecting to log in page.');
        window.location = '/user';
    } else {
        console.log('Unkonw Error! : status code', result?.status);
        document.getElementById('onLoadingBlacklistPopup').style.display = 'none';
        document.getElementById('onSuccessBlacklistPopup').style.display = 'none';
        document.getElementById('onErrorBlacklistPopup').style.display = 'block';
    }
}

async function unBanUserHandler(id) {
    document.getElementById('loadingTab').style.display = 'block';
    document.getElementById('laboratoryTab').style.display = 'none';
    document.getElementById('blacklistTab').style.display = 'none';
    document.getElementById('searchBlacklistTab').style.display = 'none';
    var result = await new Promise((resolve, reject) => {
        try {
            unBanUser(id, resolve);
        } catch (error) {
            console.log('Error! :', error.message);
            reject(null);
        }
    });
    if (result?.status == 204) {
        globalBannedUsers = globalBannedUsers.filter((user) => {
            return user.id != id;
        });
        let insideContent = `<table>
                 <tr>
                     <th>Name</th>
                     <th>Email</th>                     
                     <th>Phone Number</th>
                     <th>Action</th>
                     <th>
                        <span class="material-icons" id="searchIcon" onclick="searchBlacklistTabHandler(event)">
                            search
                        </span>
                      </th>
                 </tr>
                `;
        if (globalBannedUsers.length > 0) {
            globalBannedUsers.forEach((user) => {
                insideContent += `
                     <tr>
                       <td>
                        <span><img src="img/${user.profileImage ?? 'user-profile.svg'}" width="50px" /></span>
                        <span>${user.fullName}</span>
                        </td>
                       <td>${user.email}</td>
                       <td>${user.phoneNumber}</td>
                       <td>
                            <span class="material-icons-outlined" onclick="unBanUserHandler(${user.id});">
                                delete
                            </span>
                       </td>
                     </tr>
                    `;
            });
            insideContent += `<tr><td></td><td></td><td></td>
                <td>
                     <button onclick="addBannedUserHandler(event);">Add people to blacklist</button>
                </td>
                </tr>`;
            insideContent += '</table>';
        } else {
            insideContent = ` <p>You don't have any blacklist user.</p>
                <button onclick="addBannedUserHandler(event);">Add people to blacklist</button>`;

        }
        document.getElementById('loadingTab').style.display = 'none';
        document.getElementById('blacklistTab').innerHTML = insideContent;
        document.getElementById('blacklistTab').style.display = 'block';
    } else if (result?.status == 401) {
        console.log('Unauthorized! : status code', result.status);
        console.log('Redirecting to log in page.');
        window.location = '/user';
    } else {
        console.log('Unkonw Error! : status code', result?.status);
        document.getElementById('loadingTab').style.display = 'none';
        document.getElementById('blacklistTab').style.display = 'block';
    }
}

function searchBlacklistTabBodyUpdate(users) {
    let insideContent = `<table>
                 <tr>
                     <th>Name</th>
                     <th>Email</th>                     
                     <th>Phone Number</th>
                     <th>Action</th>
                 </tr>
                `;
    if (users.length > 0) {
        users.forEach((user) => {
            insideContent += `
                     <tr>
                       <td>
                        <span><img src="img/${user.profileImage ?? 'user-profile.svg'}" width="50px" /></span>
                        <span>${user.fullName}</span>
                        </td>
                       <td>${user.email}</td>
                       <td>${user.phoneNumber}</td>
                       <td>
                            <span class="material-icons-outlined" onclick="unBanUserHandler(${user.id});">
                                delete
                            </span>
                       </td>
                     </tr>
                    `;
        });
        insideContent += '</table>';
    } else {
        insideContent = ` <p>You don't have any blacklist user.</p>`;
    }
    document.getElementById('searchBlacklistTabBody').innerHTML = insideContent;
}

function searchBlacklistTabHandler(event) {
    searchBlacklistTabBodyUpdate(globalBannedUsers);
    document.getElementById('blacklistTab').style.display = 'none';
    document.getElementById('searchBlacklistTab').style.display = 'block';

}

function updateSearchBlacklistTab(event) {
    var searchText = event.target.value;
    if (searchText) {
        let updateBannedUser = globalBannedUsers.filter((user) => {
            return user.email.toLowerCase().includes(searchText.toLowerCase()) || user.fullName.toLowerCase().includes(searchText.toLowerCase());
        });
        if (updateBannedUser.length > 0) {
            searchBlacklistTabBodyUpdate(updateBannedUser);
        } else {
            let insideContent = `<h4>Not found any users.</h4>`;
            document.getElementById('searchBlacklistTabBody').innerHTML = insideContent;
        }
    } else {
        searchBlacklistTabBodyUpdate(globalBannedUsers);
    }
}