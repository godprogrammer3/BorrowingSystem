

window.onload = function () {
    initialMainRoom();
}

var globalCurrentRoom = null;
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
                insideContent = `<h3>Don't already have any room.</h3>`;
            }
            if (rooms.length > 0) {
                globalCurrentRoom = rooms[0];
                initialRoomDetail(globalCurrentRoom);
             
            } else {
                document.getElementById('roomDetailAvailableSectionOnLoading').style.display = 'none';
                document.getElementById('roomDetailAvailableSectionOnSuccess').style.display = 'none';
                document.getElementById('roomDetailAvailableSectionOnError').style.display = 'none';
            }
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

var globalAvailableAllDay = null;
async function initialRoomDetail(room) {
    document.getElementById('roomDetailAvailableSectionOnLoading').style.display = 'block';
    document.getElementById('roomDetailAvailableSectionOnSuccess').style.display = 'none';
    document.getElementById('roomDetailAvailableSectionOnError').style.display = 'none';
    document.getElementById('roomReservationOnLoading').style.display = 'block';
    document.getElementById('roomReservationOnSuccess').style.display = 'none';
    document.getElementById('roomReservationOnError').style.display = 'none';
    var result = await  new Promise((resolve,reject) => {
        try {
            getAvailableEquipmentInMonth(room.id, resolve);
        } catch (error) {
            console.log('Error ! :', error.message);
            reject(null);
        }
    });
    if (result) {
        var days = JSON.parse(result.body);
        globalAvailableAllDay = days;
        let insideContent;
        if (days.length > 0) {
            insideContent = `
                <span>${room.name}</span>
                <span>${room.equipmentName}</span>
                <h4>${ new Date().toLocaleDateString("en-US") }</h4>
                <section style="display:flex;">
            `;
            var nowDate = new Date();
            var lastDateOfMonth = new Date(nowDate.getFullYear(), nowDate.getMonth() + 1, 0);
            lastDateOfMonth = lastDateOfMonth.getDate();
            nowDate = nowDate.getDate();
            var firstDateOfWeek = nowDate - days[nowDate - 1].dayOfWeek + 1;
            var saveFirstDateOfweek = firstDateOfWeek;
            insideContent += `<span class="material-icons" style="visibility:hidden;">arrow_back_ios</span>`;
            for (var countDay = 0; countDay < 7; countDay++) {
                insideContent += `<span style="margin:5px;"><section><p>`;
                insideContent += dayOfWeekToString(countDay) + '</p>';
                insideContent += `<p style="${firstDateOfWeek < nowDate || firstDateOfWeek > lastDateOfMonth ? 'visibility:hidden;' : ''}${firstDateOfWeek == nowDate ? 'color:red;' : ''}"   onclick="updateRoomDetail( { id : ${room.id}, name:  '${room.name}', equipmentName :  '${room.equipmentName}' } , ${saveFirstDateOfweek} , ${firstDateOfWeek});">${firstDateOfWeek}</p>`;
                insideContent += `</section></span>`;
                firstDateOfWeek++;  
            }
            insideContent += `<span class="material-icons" style="${(firstDateOfWeek > lastDateOfMonth) ? 'visibility:hidden;' : ''}" onclick="updateRoomDetail( { id : ${room.id}, name:  '${room.name}', equipmentName :  '${room.equipmentName}' } , ${firstDateOfWeek} , ${nowDate});">arrow_forward_ios</span>`;
            insideContent += '</section>'
            insideContent += `<p>Today</p>`
            insideContent += `<section><ul style="list-style-type:none;" >`;
            for (var timeIndex = 9; timeIndex <= 21; timeIndex++) {
                insideContent += '<li>'
                insideContent += `<span>${(timeIndex == 9) ? '09' : timeIndex}:00-${timeIndex + 1}:00</span>`;
                insideContent += `<span style="margin-left:10px;">${availableQuantityToString( days[nowDate - 1].availableEquipments[timeIndex-9].quantity ) }</span>`;
                insideContent += '</li>'
            }
            insideContent += `</section></ul>`;
        } else {
            insideContent = `<h3>Error Empty content !</h3>`
        }
        let startDate = document.getElementById('startDate');
        nowDate = new Date();
        startDate.value = dateToYYYMMDD(nowDate);
        startDate.min = dateToYYYMMDD(nowDate);
        startDate.max = dateToYYYMMDD(new Date(nowDate.getFullYear(), nowDate.getMonth()+1, 0));


        document.getElementById('roomDetailAvailableSectionOnSuccess').innerHTML = insideContent;
        document.getElementById('roomDetailAvailableSectionOnLoading').style.display = 'none';
        document.getElementById('roomDetailAvailableSectionOnSuccess').style.display = 'block';
        document.getElementById('roomDetailAvailableSectionOnError').style.display = 'none';
        document.getElementById('roomReservationOnLoading').style.display = 'none';
        document.getElementById('roomReservationOnSuccess').style.display = 'block';
        document.getElementById('roomReservationOnError').style.display = 'none';
    } else {
        document.getElementById('roomDetailAvailableSectionOnLoading').style.display = 'none';
        document.getElementById('roomDetailAvailableSectionOnSuccess').style.display = 'none';
        document.getElementById('roomDetailAvailableSectionOnError').style.display = 'block';
        document.getElementById('roomReservationOnLoading').style.display = 'none';
        document.getElementById('roomReservationOnSuccess').style.display = 'none';
        document.getElementById('roomReservationOnError').style.display = 'block';
    }
}

function updateRoomDetail(room, firstDateOfWeek, currentSelectedDate) {
    let days = globalAvailableAllDay;
    let insideContent = ` 
     <span>${room.name}</span>
     <span>${room.equipmentName}</span>
     <h4>${new Date().toLocaleDateString("en-US")}</h4>
     <section style="display:flex;">`;
    var nowDate = new Date();
    var lastDateOfMonth = new Date(nowDate.getFullYear(), nowDate.getMonth() + 1, 0);
    lastDateOfMonth = lastDateOfMonth.getDate();
    nowDate = nowDate.getDate();
    saveFirstDateOfweek = firstDateOfWeek;
    insideContent += `<span class="material-icons" style="${saveFirstDateOfweek - 1 < nowDate ? 'visibility:hidden;' : ''}"  onclick="updateRoomDetail( { id : ${room.id}, name:  '${room.name}', equipmentName :  '${room.equipmentName}' } , ${saveFirstDateOfweek-7} , ${currentSelectedDate});" >arrow_back_ios</span>`;
    for (var countDay = 0; countDay < 7; countDay++) {
        insideContent += `<span style="margin:5px;"><section><p>`;
        insideContent += dayOfWeekToString(countDay)+`</p>`;
        insideContent += `<p style="${firstDateOfWeek < nowDate || firstDateOfWeek > lastDateOfMonth ? 'visibility:hidden;' : ''}${firstDateOfWeek == currentSelectedDate ? 'color:red;' : ''}"  onclick="updateRoomDetail( { id : ${room.id}, name:  '${room.name}', equipmentName :  '${room.equipmentName}' } , ${saveFirstDateOfweek} , ${firstDateOfWeek});">${firstDateOfWeek}</p>`;
        insideContent += `</section></span>`;
        firstDateOfWeek++;
    }
    insideContent += `<span class="material-icons" style="${(firstDateOfWeek > lastDateOfMonth) ? 'visibility:hidden;' : ''}"  onclick="updateRoomDetail( { id : ${room.id}, name:  '${room.name}', equipmentName :  '${room.equipmentName}' } , ${firstDateOfWeek} , ${currentSelectedDate});">arrow_forward_ios</span>`;
    insideContent += '</section>'
    insideContent += `<p>Today</p>`
    insideContent += `<section><ul style="list-style-type:none;" >`;
    for (var timeIndex = 9; timeIndex <= 21; timeIndex++) {
        insideContent += '<li>'
        insideContent += `<span>${(timeIndex == 9) ? '09' : timeIndex}:00-${timeIndex + 1}:00</span>`;
        insideContent += `<span style="margin-left:10px;">${availableQuantityToString(days[currentSelectedDate - 1].availableEquipments[timeIndex - 9].quantity)}</span>`;
        insideContent += '</li>'
    }
    insideContent += `</section></ul>`;
    document.getElementById('roomDetailAvailableSectionOnSuccess').innerHTML = insideContent; 

}

function dayOfWeekToString( dayOfWeek ) {
    var listDays = [        
        'Mo',
        'Tu',
        'We',
        'Th',
        'Fr',
        'Sa',
        'Su'
    ];
    return listDays[dayOfWeek];
}

function availableQuantityToString( quantity ) {
    if (quantity == 0) {
        return 'Reservation is full';
    } else {
        return quantity + ' available';
    }
}

async function createReservationHandler(event) {
    if (event) {
        event.preventDefault();
    }
    var roomId = globalCurrentRoom.id;
    var startDateTime = document.getElementById('startDate').value.split('-');
    startDateTime = new Date(Number(startDateTime[0]), Number(startDateTime[1]) - 1, Number(startDateTime[2]));
    var startTime = Number(document.getElementById('startTime').value);
    startDateTime.setHours(startTime,0,0)
    var hourPeriod = Number(document.getElementById('durationTime').value)
    initialCreateReservationPopupContent({
        roomId: roomId,
        startDateTime: startDateTime,
        hourPeriod: hourPeriod
    });
   

}

function initialCreateReservationPopupContent(requestParameter) {
    document.getElementById('popupOnLoading').style.display = 'nome';
    document.getElementById('popupOnSuccess').style.display = 'none';
    document.getElementById('popupOnError').style.display = 'none';
    document.getElementById('popupOnInitial').style.display = 'block';
    document.getElementById('popupOnInitialHeader').innerHTML = `Confirm reservation?`;
    document.getElementById('popupOnInitialBody').innerHTML = `
        <p><span> ${globalCurrentRoom.name} </span><span> ${globalCurrentRoom.equipmentName} </span></p>
        <p>Date :<span> ${requestParameter.startDateTime.toLocaleDateString('en-US')} </span></p>
        <p>Start at :<span> ${(requestParameter.startDateTime.getHours() == 9) ? '0'+requestParameter.startDateTime.getHours(): requestParameter.startDateTime.getHours()}:00</span></p>
        <p>Untill :<span> ${requestParameter.startDateTime.getHours()+requestParameter.hourPeriod}:00 </span></p>
    `;
    document.getElementById('popupOnInitialCofirmButton').innerHTML = 'Confirm'
    document.getElementById('popupOnInitialCofirmButton').onclick = function (event) { confirmCreateReservationPopupHandler(requestParameter); };
    document.getElementById('popup').style.display = "block";
}

async function confirmCreateReservationPopupHandler(requestParameter) {
    document.getElementById('popupOnLoading').style.display = 'block';
    document.getElementById('popupOnSuccess').style.display = 'none';
    document.getElementById('popupOnError').style.display = 'none';
    document.getElementById('popupOnInitial').style.display = 'none';
    var result = await new Promise((resolve, reject) => {
        try {
            createReservation( requestParameter.roomId , requestParameter.startDateTime , requestParameter.hourPeriod, resolve);
        } catch (error) {
            console.log('Error ! :', error.message);
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
                initialMainRoom();
            };
        }else if (result.status == 409 || result.status == 410) {
            console.log('Error ! : status code', result.status);

            document.getElementById('popupOnErrorMessage').innerHTML = result.body;

            document.getElementById('popupOnLoading').style.display = 'none';
            document.getElementById('popupOnSuccess').style.display = 'none';
            document.getElementById('popupOnError').style.display = 'block';
            document.getElementById('popupOnInitial').style.display = 'none';
        }
        else {
            console.log('Error ! : status code', result.status);

            document.getElementById('popupOnErrorMessage').innerHTML = 'Unknown error!'

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

function dateToYYYMMDD(date){
    var mm = date.getMonth() + 1; 
    var dd = date.getDate();

    return [date.getFullYear(),
    (mm > 9 ? '' : '0') +mm,
    (dd > 9 ? '' : '0') + dd
    ].join('-');
};