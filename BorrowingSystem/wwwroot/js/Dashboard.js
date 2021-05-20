window.onload = function () {
    initialMainRoom();
}

async function initialMainRoom(event) {
    if (event) {
        event.preventDefault();
    }
    document.getElementById('roomSectionOnLoading').style.display = 'block';
    document.getElementById('roomSectionOnSuccess').style.display = 'none';
    document.getElementById('roomSectionOnError').style.display = 'none';
    var result = await new Promise((resolve, reject) => {
        try {
            getAllRoom(resolve);
        } catch (error) {
            console.log('Error ! :', error.message);
            reject(null);
        }
        
    });
    if (result != null) {
        if (result.status == 200) {
            let rooms = JSON.parse(result.body)
            let insideContent;
            if (rooms.length > 0) {
                insideContent = '<ul style="list-style-type:none;">'
                rooms.forEach((room) => {
                    insideContent += `<li>${room.name}</li>`;
                });
                insideContent += '</ul>';
            } else {
                insideContent = `<h3>Don't already have any equipment.</h3>`;
            }
            initialRoomDetail(rooms[0]);
            document.getElementById('roomSectionOnSuccess').innerHTML = insideContent;
            document.getElementById('roomSectionOnLoading').style.display = 'none';
            document.getElementById('roomSectionOnSuccess').style.display = 'block';
            document.getElementById('roomSectionOnError').style.display = 'none';   
        } else if (result.status == 401) {
            window.location = "/user";
        } else {
            document.getElementById('roomSectionOnLoading').style.display = 'none';
            document.getElementById('roomSectionOnSuccess').style.display = 'none';
            document.getElementById('roomSectionOnError').style.display = 'block';
        }
        
    } else {
        document.getElementById('roomSectionOnLoading').style.display = 'none';
        document.getElementById('roomSectionOnSuccess').style.display = 'none';
        document.getElementById('roomSectionOnError').style.display = 'block';
    }
}

async function initialRoomDetail(room) {
    var result = new Promise((resolve,reject) => {
        try {
            getAvailableEquipmentInMonth(room.id, resolve);
        } catch (error) {
            console.log('Error ! :', error.message);
            reject(null);
        }
    });
    if (result) {
        var days = JSON.parse(result.body);
        console.log(days);
        let insideContent;
        if (days.length > 0) {
            sideContent = `<h3>Succeess.</h3>`
        } else {
            insideContent = `<h3>Error Empty content !</h3>`
        }
        document.getElementById('roomDetailSectionOnSuccess').innerHTML = insideContent;
        document.getElementById('roomDetailSectionOnLoading').style.display = 'none';
        document.getElementById('roomDetailSectionOnSuccess').style.display = 'block';
        document.getElementById('roomDetailSectionOnError').style.display = 'none';
    } else {
        document.getElementById('roomDetailSectionOnLoading').style.display = 'none';
        document.getElementById('roomDetailSectionOnSuccess').style.display = 'none';
        document.getElementById('roomDetailSectionOnError').style.display = 'block';
    }
}

