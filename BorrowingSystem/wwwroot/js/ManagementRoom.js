window.onload = function () {
    initialBodyContent();
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
    document.getElementById('popupOnInitialHeader').innerHTML = ``;
    document.getElementById('popupOnInitialBody').innerHTML = `
        <label for="popupOnInitialBodyNameInput">Name</lable>
        <input type="text" id="popupOnInitialBodyNameInput" value = ''/>
        <label for="popupOnInitialBodyEquipmentNumberInput">Equipment Number</lable>
        <input type="text" id="popupOnInitialBodyEquipmentNumberInput" value = ''/>
    `;
    document.getElementById('popupOnInitialCofirmButton').innerHTML = 'Add'
    document.getElementById('popupOnInitialCofirmButton').onclick = confirmAddEquipmentHandler;
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
    document.getElementById('popupOnInitialHeader').innerHTML = `Remove ${equipment.name} ?`;
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
    document.getElementById('popupOnInitialHeader').innerHTML = ``;
    document.getElementById('popupOnInitialBody').innerHTML = `
        <label for="popupOnInitialBodyNameInput">Name</lable>
        <input type="text" id="popupOnInitialBodyNameInput" value = "${equipment.name}" />
        <label for="popupOnInitialBodyEquipmentNumberInput">Equipment Number</lable>
        <input type="text" id="popupOnInitialBodyEquipmentNumberInput" value = "${equipment.serialNumber}" />
        <input type="radio" id="available" name="equipmentStatus" value="0" ${equipment.status == 0 ? 'checked' : ''}>
        <label for="available">Available</label>
        <input type="radio" id="repairing" name="equipmentStatus" value="1" ${equipment.status == 1 ? 'checked' : ''}>
        <label for="repairing">Repairing</label><br>
        
    `;
    document.getElementById('popupOnInitialCofirmButton').innerHTML = 'Edit'
    document.getElementById('popupOnInitialCofirmButton').onclick = function (event) { confirmEditEquipmentHandler(equipment) };
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