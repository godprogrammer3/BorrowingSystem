window.onload = function () {
    checkDisplayNavigationBar();
    initialBodyContent();
    var date = new Date();
    document.getElementById('currentTime').innerHTML = getHHMMTimeFromDate(date);
    setInterval(function () {
        document.getElementById('currentTime').innerHTML = getHHMMTimeFromDate(new Date());
    }, 1000);
    var userDate = JSON.parse(localStorage.getItem('UserData'));
    if (userDate.profileImage != null) {
        document.getElementById('userProfileImage').src = '/img/' + userDate.profileImage;
    } else {
        document.getElementById('userProfileImage').src = '/img/user-profile.svg'
    }
}

async function initialBodyContent() {
    document.getElementById('bodyContentOnloading').style.display = 'block';
    document.getElementById('bodyContentOnSuccess').style.display = 'none';
    document.getElementById('bodyContentOnError').style.display = 'none';
    var result = await new Promise((resolve, reject) => {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const id = urlParams.get('id');
            getAllEquipmentByRoom(id, resolve);
        } catch (error) {
            console.log('Error ! :', error.message);
            reject(null);
        }
    });
    if (result) {
        if (result.status == 200) {
            let equipments = JSON.parse(result.body);
            let insideContent;
            if (equipments.length > 0) {
                insideContent = `
                <table>
                    <tr>
                        <th>Name</th>
                        <th>Equipment number</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
            `;
                equipments.forEach((equipment) => {
                    insideContent += `
                    <tr>
                        <td>${equipment.name}</td>
                        <td>${equipment.serialNumber}</td>
                        <td>${equipment.status == 0 ? 'Available' : 'Repairing'}</td>
                        <td>
                            <span class="material-icons" onclick="editEquipmentHandler({ id: ${equipment.id} , name:'${equipment.name}' , serialNumber: '${equipment.serialNumber}' , status: '${equipment.status}'})">
                                edit
                            </span>
                            <span class="material-icons" onclick="deleteEquipmentHandler({ id: ${equipment.id} , name:'${equipment.name}' })">
                                delete
                            </span>
                        </td>
                    </tr>
                `;
                });
                insideContent += `
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td><button onclick="addEquipmentHandler(event)">Add equipment</button></td>
                </tr>
                `;
            } else {
                insideContent = `<h3>Don't already have any equipment.</h3>
                    <button onclick="addEquipmentHandler(event)">Add equipment</button>
                `;
            }

            document.getElementById('bodyContentOnSuccess').innerHTML = insideContent;

            document.getElementById('bodyContentOnloading').style.display = 'none';
            document.getElementById('bodyContentOnSuccess').style.display = 'block';
            document.getElementById('bodyContentOnError').style.display = 'none';
        } else if (result.status == 401) {
            window.location = "/user";
        }
    } else {
        document.getElementById('bodyContentOnloading').style.display = 'none';
        document.getElementById('bodyContentOnSuccess').style.display = 'none';
        document.getElementById('bodyContentOnError').style.display = 'block';
    }
}

function addEquipmentHandler(event) {
    initalAddEquipmentPopup();
    document.getElementById('popupOnLoading').style.display = 'none';
    document.getElementById('popupOnSuccess').style.display = 'none';
    document.getElementById('popupOnError').style.display = 'none';
    document.getElementById('popupOnInitial').style.display = 'block';
}

function initalAddEquipmentPopup() {
    document.getElementById('popupOnInitialHeader').innerHTML = `
        <h3 class="popup-header">Create Equipment</h3>
    `;
    document.getElementById('popupOnInitialBody').innerHTML = ` 
     <div class="center-row-flex">
        <form  id="popupForm"  style="text-align:center;">
            <input type="text" id="popupOnInitialBodyNameInput" value = '' placeholder="Enter equipment's name..." class="popup-input" required />
            <input type="text" id="popupOnInitialBodyEquipmentNumberInput" value = '' placeholder="Enter equipment's number..." class="popup-input" required />
             <button id="popupFormButton" type="submit" style="display:none;" ></button>
        </form>
    </div>
    `;
    document.getElementById('popupForm').onsubmit = function (event) {
        event.preventDefault();
        confirmAddEquipmentHandler(event);
    };
    document.getElementById('popupOnInitialCofirmButton').innerHTML = 'Add'
    document.getElementById('popupOnInitialCofirmButton').onclick = function () {
        document.getElementById('popupFormButton').click();
    };
    document.getElementById('popup').style.display = "block";
}

async function confirmAddEquipmentHandler(event) {
    document.getElementById('popupOnLoading').style.display = 'block';
    document.getElementById('popupOnSuccess').style.display = 'none';
    document.getElementById('popupOnError').style.display = 'none';
    document.getElementById('popupOnInitial').style.display = 'none';
    var roomId = new URLSearchParams(window.location.search).get('id');
    var name = document.getElementById('popupOnInitialBodyNameInput').value;
    var equipmentNumber = document.getElementById('popupOnInitialBodyEquipmentNumberInput').value;
    var result = await new Promise((resolve, reject) => {
        try {
            createEquipment(roomId, name, equipmentNumber,resolve);
        } catch (error) {
            coonsole.log('Error ! :', error.message);
            reject(null);
        }
    });
    if (result) {
        if (result.status == 204) {
            document.getElementById('popupOnLoading').style.display = 'none';
            document.getElementById('popupOnSuccess').style.display = 'block';
            document.getElementById('popupOnError').style.display = 'none';
            document.getElementById('popupOnInitial').style.display = 'none';
            document.getElementById('popupOnSuccessConfirmButton').onclick = (event) => {
                document.getElementById('popup').style.display = 'none';
                initialBodyContent();
            };
        } else {
            console.log('Error ! : status code', result.status);
            document.getElementById('popupOnLoading').style.display = 'none';
            document.getElementById('popupOnSuccess').style.display = 'none';
            document.getElementById('popupOnError').style.display = 'block';
            document.getElementById('popupOnInitial').style.display = 'none';
        }
    } else {
        document.getElementById('popupOnLoading').style.display = 'none';
        document.getElementById('popupOnSuccess').style.display = 'none';
        document.getElementById('popupOnError').style.display = 'block';
        document.getElementById('popupOnInitial').style.display = 'none';
    }
}

function deleteEquipmentHandler(equipment) {
    initalDeleteEquipmentPopup(equipment);
    document.getElementById('popupOnLoading').style.display = 'none';
    document.getElementById('popupOnSuccess').style.display = 'none';
    document.getElementById('popupOnError').style.display = 'none';
    document.getElementById('popupOnInitial').style.display = 'block';
}

function initalDeleteEquipmentPopup(equipment) {
    document.getElementById('popupOnLoading').style.display = 'none';
    document.getElementById('popupOnSuccess').style.display = 'none';
    document.getElementById('popupOnError').style.display = 'none';
    document.getElementById('popupOnInitial').style.display = 'block';
    document.getElementById('popupOnInitialHeader').innerHTML = `<h3 class="popup-header">Remove ${equipment.name} ? <h3>`;
    document.getElementById('popupOnInitialBody').innerHTML = ``;
    document.getElementById('popupOnInitialCofirmButton').innerHTML = 'Remove'
    document.getElementById('popupOnInitialCofirmButton').onclick = function (event) { confirmDeleteEquipmentHandler(equipment); };
    document.getElementById('popup').style.display = "block";
}

async function confirmDeleteEquipmentHandler(equipment){
    document.getElementById('popupOnLoading').style.display = 'block';
    document.getElementById('popupOnSuccess').style.display = 'none';
    document.getElementById('popupOnError').style.display = 'none';
    document.getElementById('popupOnInitial').style.display = 'none';
    var result = await new Promise((resolve, reject) => {
        try {
            deleteEquipment(equipment.id, resolve);
        } catch (error) {
            coonsole.log('Error ! :', error.message);
            reject(null);
        }
    });
    if (result) {
        if (result.status == 204) {
            document.getElementById('popupOnLoading').style.display = 'none';
            document.getElementById('popupOnSuccess').style.display = 'block';
            document.getElementById('popupOnError').style.display = 'none';
            document.getElementById('popupOnInitial').style.display = 'none';
            document.getElementById('popupOnSuccessConfirmButton').onclick = (event) => {
                document.getElementById('popup').style.display = 'none';
                initialBodyContent();
            };
        } else {
            console.log('Error ! : status code', result.status);
            document.getElementById('popupOnLoading').style.display = 'none';
            document.getElementById('popupOnSuccess').style.display = 'none';
            document.getElementById('popupOnError').style.display = 'block';
            document.getElementById('popupOnInitial').style.display = 'none';
        }
    } else {
        document.getElementById('popupOnLoading').style.display = 'none';
        document.getElementById('popupOnSuccess').style.display = 'none';
        document.getElementById('popupOnError').style.display = 'block';
        document.getElementById('popupOnInitial').style.display = 'none';
    }
}

function editEquipmentHandler(equipment) {
    initalEditEquipmentPopup(equipment);
    document.getElementById('popupOnLoading').style.display = 'none';
    document.getElementById('popupOnSuccess').style.display = 'none';
    document.getElementById('popupOnError').style.display = 'none';
    document.getElementById('popupOnInitial').style.display = 'block';
}

function initalEditEquipmentPopup(equipment) {
    document.getElementById('popupOnInitialHeader').innerHTML = ` <h3 class="popup-header">Edit Equipment</h3>`;
    document.getElementById('popupOnInitialBody').innerHTML = `
    <div class="center-row-flex">
      <form  id="popupForm"  style="text-align:center;">
        <input type="text" id="popupOnInitialBodyNameInput" value = "${equipment.name}" placeholder="Enter equipment's name..." class="popup-input" required />
        <input type="text" id="popupOnInitialBodyEquipmentNumberInput" value = "${equipment.serialNumber}" placeholder="Enter equipment's number..." class="popup-input" required />
        <input type="radio" id="available" name="equipmentStatus" value="0" ${equipment.status == 0 ? 'checked' : ''}>
        <label for="available">Available</label>
        <input type="radio" id="repairing" name="equipmentStatus" value="1" ${equipment.status == 1 ? 'checked' : ''}>
        <label for="repairing">Repairing</label><br>
        <button id="popupFormButton" type="submit" style="display:none;" ></button>
       </form>
    </div> 
    `;
    document.getElementById('popupForm').onsubmit = function (event) {
        event.preventDefault();
        confirmEditEquipmentHandler(equipment);
    };
    document.getElementById('popupOnInitialCofirmButton').innerHTML = 'Edit'
    document.getElementById('popupOnInitialCofirmButton').onclick = function (event) { document.getElementById('popupFormButton').click(); };
    document.getElementById('popup').style.display = "block";
}

async function confirmEditEquipmentHandler(equipment) {
    document.getElementById('popupOnLoading').style.display = 'block';
    document.getElementById('popupOnSuccess').style.display = 'none';
    document.getElementById('popupOnError').style.display = 'none';
    document.getElementById('popupOnInitial').style.display = 'none';
    var newName = document.getElementById('popupOnInitialBodyNameInput').value
    var newEquipmentNumber = document.getElementById('popupOnInitialBodyEquipmentNumberInput').value
    var newStatus = document.querySelector('input[name="equipmentStatus"]:checked').value;
    console.log('newEquipmentNumber :', newEquipmentNumber);
    var result = await new Promise((resolve, reject) => {
        try {
            patchEquipment(equipment.id, newName, newEquipmentNumber, newStatus, resolve);
        } catch (error) {
            coonsole.log('Error ! :', error.message);
            reject(null);
        }
    });
    if (result) {
        if (result.status == 204) {
            document.getElementById('popupOnLoading').style.display = 'none';
            document.getElementById('popupOnSuccess').style.display = 'block';
            document.getElementById('popupOnError').style.display = 'none';
            document.getElementById('popupOnInitial').style.display = 'none';
            document.getElementById('popupOnSuccessConfirmButton').onclick = (event) => {
                document.getElementById('popup').style.display = 'none';
                initialBodyContent();
            };
        } else {
            console.log('Error ! : status code', result.status);
            document.getElementById('popupOnLoading').style.display = 'none';
            document.getElementById('popupOnSuccess').style.display = 'none';
            document.getElementById('popupOnError').style.display = 'block';
            document.getElementById('popupOnInitial').style.display = 'none';
        }
    } else {
        document.getElementById('popupOnLoading').style.display = 'none';
        document.getElementById('popupOnSuccess').style.display = 'none';
        document.getElementById('popupOnError').style.display = 'block';
        document.getElementById('popupOnInitial').style.display = 'none';
    }
}

function getHHMMTimeFromDate(date) {
    return (date.getHours() < 9 ? '0' + date.getHours() : date.getHours()) + ':' + (date.getMinutes() < 9 ? '0' + date.getMinutes() : date.getMinutes());
}