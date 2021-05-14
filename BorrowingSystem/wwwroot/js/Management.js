window.onload = function(){
    initialRooms();
}

function initialRooms() {
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
                     <th>Date Modified</th>                     
                     <th>Create By</th>
                     <th>Action</th>
                 </tr>
                `;
                rooms.forEach((room) => {
                    var bits = room.dateModified.split(/\D/);
                    var date = new Date(bits[0], --bits[1], bits[2], bits[3], bits[4], bits[5]);
                    insideContent += `
                     <tr>
                       <td>${room.name}</td>
                       <td>${date.toLocaleString()}</td>
                       <td>${room.createBy}</td>
                       <td>
                            <span class="material-icons-outlined" onclick="editRoomHandler({id:${room.id},name:'${room.name}'})">
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
        }
    })
        .catch(error => {
            console.log('Error :', error.message);

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
    document.getElementById('headerOnInitialPopupContent').innerHTML = `<h3>New Laboratory</h3>`;
    document.getElementById('bodyOnInitialPopupContent').innerHTML = `<input type="text" name="roomName" id="roomName" value="" placeholder="Enter room's name..." />`;
    document.getElementById('confirmButtonOnInitialPopupContent').innerHTML = 'Create';
    document.getElementById('confirmButtonOnInitialPopupContent').onclick = function (event) {
        confirmCreateRoom(event);
    };
    document.getElementById('onInitialPopup').style.display = 'block';
    document.getElementById('popup').style.display = 'block';
}

function confirmCreateRoom(event) {
    var name = document.getElementById('roomName').value;
    document.getElementById('onInitialPopup').style.display = 'none';
    document.getElementById('onLoadingPopup').style.display = 'block';
    new Promise((resolve, reject) => {
        try {
            createRoom(name, resolve);
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
        }else {
            console.log('Unkonw Error! : status code', data.status);
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
    document.getElementById('headerOnInitialPopupContent').innerHTML = `<h3>Remove <strong>${room.name}</strong> Laboratory?</h3>`;
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

function editRoomHandler(room) {
    document.getElementById('headerOnInitialPopupContent').innerHTML = `<h3>Edit name</h3>`;
    document.getElementById('bodyOnInitialPopupContent').innerHTML = `<input type="text" name="roomName" id="roomName" value="${room.name}" placeholder="Enter room's name..."  />`;
    document.getElementById('confirmButtonOnInitialPopupContent').innerHTML = 'Edit';
    document.getElementById('confirmButtonOnInitialPopupContent').onclick = function (event) {
        confirmEditRoom(room);
    };
    document.getElementById('onInitialPopup').style.display = 'block';
    document.getElementById('popup').style.display = 'block';
}

function confirmEditRoom(room) {
    document.getElementById('onInitialPopup').style.display = 'none';
    document.getElementById('onLoadingPopup').style.display = 'block';
    var newName = document.getElementById('roomName').value;
    new Promise((resolve, reject) => {
        try {
            editRoom(room.id, newName,resolve);
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

