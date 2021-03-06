window.onload = function () {
    checkDisplayNavigationBar();
    initialMainRoom();
    var date = new Date();
    document.getElementById('currentTime').innerHTML = getHHMMTimeFromDate(date);
    setInterval(function () {
        document.getElementById('currentTime').innerHTML = getHHMMTimeFromDate(new Date());
    }, 1000);
    var userDate = JSON.parse(localStorage.getItem('UserData'));
    document.getElementById('userFullName').innerHTML = userDate.fullName;
    if (userDate.profileImage != null) {
        document.getElementById('userProfileImage').src = '/img/' + userDate.profileImage;
    } else {
        document.getElementById('userProfileImage').src = '/img/user-profile.svg'
    }
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
                insideContent = '<ul style="list-style-type:none;padding-inline-start: 0;" >'
                rooms.forEach((room) => {
                    insideContent += `<div class="room-list">
                    <span onclick="initialRoomDetail({  id:  ${room.id}, name: '${room.name}', equipmentName : '${room.equipmentName}'})"
                      >${room.name}</span><br>
                    <span class = 'equipment${room.id}'>${room.equipmentName}</span>
                    </div>`;
                });
                insideContent += '</ul>';
            } else {
                insideContent = `<h3>Don't already have any room.</h3>`;
            }
            document.getElementById('roomSectionOnSuccess').innerHTML = insideContent;
            document.getElementById('roomSectionOnLoading').style.display = 'none';
            document.getElementById('roomSectionOnSuccess').style.display = 'block';
            document.getElementById('roomSectionOnError').style.display = 'none';
            if (rooms.length > 0) {
                globalCurrentRoom = rooms[0];
                initialRoomDetail(globalCurrentRoom);
                document.getElementById('roomReservation').style.display = 'block';
            } else {
                document.getElementById('roomReservation').style.display = 'none';
                document.getElementById('roomDetailAvailableSectionOnLoading').style.display = 'none';
                document.getElementById('roomDetailAvailableSectionOnSuccess').style.display = 'none';
                document.getElementById('roomDetailAvailableSectionOnError').style.display = 'none';
            }  
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
var globalCurrentHourSelect = null;
async function initialRoomDetail(room) {
    const mountNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    globalCurrentRoom = room;
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
    let initalDate = new Date();
    if (result) {
        if (result.status == 200) {
            var days = JSON.parse(result.body);
            globalAvailableAllDay = days;
            let insideContent;
            if (days.length > 0) {
                insideContent = `
                <span id="roomName" >${room.name}</span>
                <span id="equipmentName">${room.equipmentName}</span>
                <h4 id="displayDate" >${initalDate.getDate()}   ${mountNames[initalDate.getMonth()]}   ${initalDate.getFullYear()}</h4>
                <section style="display:flex;" class = "displayCalender">
            `;
                var userData = JSON.parse(localStorage.getItem('UserData'));
                var nowDate = new Date();
                var lastDateOfMonth = new Date(nowDate.getFullYear(), nowDate.getMonth() + 1, 0);
                lastDateOfMonth = lastDateOfMonth.getDate();
                nowDate = nowDate.getDate();
                var firstDateOfWeek = nowDate - (new Date()).getDay() + 1;
                var saveFirstDateOfweek = firstDateOfWeek;
                insideContent += `<span class="material-icons" style="visibility:hidden;cursor:pointer;">arrow_back_ios</span>`;
                for (var countDay = 0; countDay < 7; countDay++) {
                    insideContent += `<span style="margin:10px;"><section><p style = "font-size:15px;">`;
                    insideContent += dayOfWeekToString(countDay) + '</p>';
                    insideContent += `<div   onclick="updateRoomDetail( { id : ${room.id}, name:  '${room.name}', equipmentName :  '${room.equipmentName}' } , ${saveFirstDateOfweek} , ${firstDateOfWeek});" class="day-button" id = "Day${countDay}" style = "${firstDateOfWeek < nowDate || firstDateOfWeek > lastDateOfMonth ? 'visibility:hidden;' : ''}   ${firstDateOfWeek == nowDate ? 'background-color:#9D0042;border-color:#9D0042;' : ''}   "><p class="day-button-text" style = "${firstDateOfWeek == nowDate ? 'color:white;' : ''}"   >${firstDateOfWeek}</p></div>`;
                    insideContent += `</section></span>`;
                    firstDateOfWeek++;
                }
                insideContent += `<span class="material-icons" style="cursor:pointer;  ${(firstDateOfWeek > lastDateOfMonth) ? 'visibility:hidden;' : ''}" onclick="updateRoomDetail( { id : ${room.id}, name:  '${room.name}', equipmentName :  '${room.equipmentName}' } , ${firstDateOfWeek} , ${nowDate}); ">arrow_forward_ios</span>`;
                insideContent += '</section>'
                insideContent += `<p>Today</p>`
                insideContent += `<section><ul style="list-style-type:none;" >`;
                globalCurrentHourSelect = new Date().getHours(); timeIndex;
                for (var timeIndex = globalCurrentHourSelect; timeIndex <= 21; timeIndex++) {
                    insideContent += `<li id="hourSelect${timeIndex}"  ${userData.role == 'admin' ? 'onclick="adminSelectHour('+  room.id  +',' + nowDate  +','+ timeIndex + ');"' : ''}   style="${(userData.role == 'admin' && timeIndex == globalCurrentHourSelect) ? 'color:red;' : ''}" >`
                    insideContent += `<span>${(timeIndex == 9) ? '09' : timeIndex}:00-${timeIndex + 1}:00</span>`;
                    insideContent += `<span id = "time${timeIndex - 9}" style="margin-left:10px;">${availableQuantityToString(days[0][timeIndex - 9])}</span>`;
                    insideContent += '</li>'
                }
                insideContent += `</section></ul>`;
            } else {
                insideContent = `<h3>Error Empty content !</h3>`
            }
            var userData = JSON.parse(localStorage.getItem('UserData'));
            if (userData.role == 'admin') {
                document.getElementById('roomReservationOnSuccessUser').style.display = 'none';
                document.getElementById('roomReservationOnSuccessAdmin').style.display = 'block';
                initalUserReservation(room.id, nowDate, 9);
            } else {
                document.getElementById('roomReservationOnSuccessUser').style.display = 'block';
                document.getElementById('roomReservationOnSuccessAdmin').style.display = 'none';
                let startDate = document.getElementById('startDate');
                nowDate = new Date();
                startDate.value = dateToYYYMMDD(nowDate);
                startDate.min = dateToYYYMMDD(nowDate);
                startDate.max = dateToYYYMMDD(new Date(nowDate.getFullYear(), nowDate.getMonth() + 1, 0));
            }
            document.getElementById('roomDetailAvailableSectionOnSuccess').innerHTML = insideContent;
            document.getElementById('roomDetailAvailableSectionOnLoading').style.display = 'none';
            document.getElementById('roomDetailAvailableSectionOnSuccess').style.display = 'block';
            document.getElementById('roomDetailAvailableSectionOnError').style.display = 'none';
            document.getElementById('roomReservationOnLoading').style.display = 'none';
            document.getElementById('roomReservationOnSuccess').style.display = 'block';
            document.getElementById('roomReservationOnError').style.display = 'none';
        } else {
            console.log('Unknown error ! : status code', result.status);
            document.getElementById('roomDetailAvailableSectionOnErrorMessage').innerHTML = 'Unknow Error !';
            document.getElementById('roomDetailAvailableSectionOnLoading').style.display = 'none';
            document.getElementById('roomDetailAvailableSectionOnSuccess').style.display = 'none';
            document.getElementById('roomDetailAvailableSectionOnError').style.display = 'block';
            document.getElementById('roomReservationOnErrorMessage').innerHTML = 'Unknow Error !';
            document.getElementById('roomReservationOnLoading').style.display = 'none';
            document.getElementById('roomReservationOnSuccess').style.display = 'none';
            document.getElementById('roomReservationOnError').style.display = 'block';
        }
       
    } else {
        console.log('Unknow error ! : status code', result.status);
        document.getElementById('roomDetailAvailableSectionOnErrorMessage').innerHTML = 'Unknow Error !';
        document.getElementById('roomDetailAvailableSectionOnLoading').style.display = 'none';
        document.getElementById('roomDetailAvailableSectionOnSuccess').style.display = 'none';
        document.getElementById('roomDetailAvailableSectionOnError').style.display = 'block';
        document.getElementById('roomReservationOnErrorMessage').innerHTML = 'Unknow Error !';
        document.getElementById('roomReservationOnLoading').style.display = 'none';
        document.getElementById('roomReservationOnSuccess').style.display = 'none';
        document.getElementById('roomReservationOnError').style.display = 'block';
    }
}

function updateRoomDetail(room, firstDateOfWeek, currentSelectedDate) {
    let initalDate = new Date();
    let days = globalAvailableAllDay;
    const mountNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let insideContent = `
    <span id="roomName" >${room.name}</span>
                <span id="equipmentName">${room.equipmentName}</span>
                <h4 id="displayDate" >${initalDate.getDate()}   ${mountNames[initalDate.getMonth()]}   ${initalDate.getFullYear()}</h4>
                <section style="display:flex;" class = "displayCalender">
        `;
    var nowDate = new Date();
    var lastDateOfMonth = new Date(nowDate.getFullYear(), nowDate.getMonth() + 1, 0);
    lastDateOfMonth = lastDateOfMonth.getDate();
    nowDate = nowDate.getDate();
    saveFirstDateOfweek = firstDateOfWeek;
    var userData = JSON.parse(localStorage.getItem('UserData'));
    insideContent += `<span class="material-icons" style="cursor:pointer;  ${saveFirstDateOfweek - 1 < nowDate ? 'visibility:hidden;' : ''}"  onclick="updateRoomDetail( { id : ${room.id}, name:  '${room.name}', equipmentName :  '${room.equipmentName}' } , ${saveFirstDateOfweek-7} , ${currentSelectedDate});" >arrow_back_ios</span>`;
    for (var countDay = 0; countDay < 7; countDay++) {
        insideContent += `<span style="margin:10px;"><section><p style = "font-size:15px;">`;
        insideContent += dayOfWeekToString(countDay) + `</p>`;
        insideContent += `<div onclick="updateRoomDetail( { id : ${room.id}, name:  '${room.name}', equipmentName :  '${room.equipmentName}' } , ${saveFirstDateOfweek} , ${firstDateOfWeek});"  class="day-button" id = "Day${countDay}" style = "${firstDateOfWeek < nowDate || firstDateOfWeek > lastDateOfMonth ? 'visibility:hidden;' : ''}   ${firstDateOfWeek == currentSelectedDate ? 'background-color:#9D0042;border-color:#9D0042;' : ''}   "><p class="day-button-text" style = "${firstDateOfWeek == currentSelectedDate ? 'color:white;' : ''}"    >${firstDateOfWeek}</p></div>`;
        //insideContent += `<div id = "Day${countDay}" style = "${firstDateOfWeek < nowDate || firstDateOfWeek > lastDateOfMonth ? 'visibility:hidden;' : ''}" ><p style="${firstDateOfWeek == currentSelectedDate ? 'color:red;' : ''}"  onclick="updateRoomDetail( { id : ${room.id}, name:  '${room.name}', equipmentName :  '${room.equipmentName}' } , ${saveFirstDateOfweek} , ${firstDateOfWeek});">${firstDateOfWeek}</p></div>`;
        insideContent += `</section></span>`;
        firstDateOfWeek++;
    }
    insideContent += `<span class="material-icons" style="cursor:pointer;   ${(firstDateOfWeek > lastDateOfMonth) ? 'visibility:hidden;' : ''}"  onclick="updateRoomDetail( { id : ${room.id}, name:  '${room.name}', equipmentName :  '${room.equipmentName}' } , ${firstDateOfWeek} , ${currentSelectedDate});">arrow_forward_ios</span>`;
    insideContent += '</section>'
    insideContent += `<p id = "todayText">Today</p>`
    insideContent += `<section><ul style="list-style-type:none;" >`;
    globalCurrentHourSelect = new Date().getHours() 
    adminSelectHour(room.id, currentSelectedDate, globalCurrentHourSelect);
    for (var timeIndex = new Date().getHours(); timeIndex <= 21; timeIndex++) {
        insideContent += `<li id="hourSelect${timeIndex}"  ${userData.role == 'admin' ? 'onclick="adminSelectHour(' + room.id + ',' + currentSelectedDate + ',' + timeIndex + ');"' : ''}   style="${(userData.role == 'admin' && timeIndex == globalCurrentHourSelect) ? 'color:red;' : ''}" >`
        insideContent += `<span>${(timeIndex == 9) ? '09' : timeIndex}:00-${timeIndex + 1}:00</span>`;
        insideContent += `<span style="margin-left:10px;">${availableQuantityToString(days[currentSelectedDate - nowDate][timeIndex - 9])}</span>`;
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
    document.getElementById('popupOnInitialHeader').innerHTML = `<h3 class="popup-header">Confirm reservation?</h3>`;
    document.getElementById('popupOnInitialBody').innerHTML = `
     <div id="createPopupContent">
        <p><span> ${globalCurrentRoom.name} </span><span> ${globalCurrentRoom.equipmentName} </span></p>
        <p>Date :<span> ${requestParameter.startDateTime.toLocaleDateString('en-US')} </span></p>
        <p>Start at :<span> ${(requestParameter.startDateTime.getHours() == 9) ? '0'+requestParameter.startDateTime.getHours(): requestParameter.startDateTime.getHours()}:00</span></p>
        <p>Untill :<span> ${requestParameter.startDateTime.getHours() + requestParameter.hourPeriod}:00 </span></p>
     </div>
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
        if (result.status == 204 || result.status == 201) {
            document.getElementById('popupOnLoading').style.display = 'none';
            document.getElementById('popupOnSuccess').style.display = 'block';
            document.getElementById('popupOnError').style.display = 'none';
            document.getElementById('popupOnInitial').style.display = 'none';
            document.getElementById('popupOnSuccessConfirmButton').onclick = (event) => {
                document.getElementById('popup').style.display = 'none';
                initialRoomDetail(globalCurrentRoom);
            };
        } else if (result.status == 409 || result.status == 410 || result.status == 403 || result.status == 400 ) {
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

async function  initalUserReservation(roomId,date,hour) {
    var result = await new Promise((resolve, reject) => {
        try {
            getReservationByRoomDateHour(roomId, date, hour, resolve);
        } catch (error) {
            console.log('Error ! :', error.message);
            reject(null);
        }

    });
    if (result != null) {
        if (result.status == 200) {
            let reservations = JSON.parse(result.body)
            let insideContent;
            insideContent = '<h3 class="popup-header">User</h3>';
            if (reservations.length > 0) {
                insideContent += '<ul style="list-style-type:none;padding-inline-start:0;height: 30vh;overflow - y: scroll;">'
                reservations.forEach((reservation,index) => {
                    insideContent += `<li class="user-info">`;
                    insideContent += `<img style="margin:20px;" class="image-profile-li" src="/img/${reservation.user.profileImage != null ? reservation.user.profileImage : 'user-profile.svg'}"   alt="profile iamge" />`;
                    insideContent += `<span style="margin:20px;">${reservation.user.fullName}</span>`;
                    insideContent += `<span style="margin:20px;cursor:pointer;" class="material-icons" onclick="document.getElementById('dropDownActionMenu${index}').style.display = 'block'; ">more_horiz</span>`;
                    insideContent += `<section class="dropDownActionMenu" id="dropDownActionMenu${index}" style="display:none;"><ul style="list-style-type:none;padding-inline-start:0;">`;
                    insideContent += `<li class="li-item" onclick="initialProfileDataPopup({ fullName: '${reservation.user.fullName}',  email: '${reservation.user.email}', phoneNumber : '${reservation.user.phoneNumber}', profileImage : '${reservation.user.profileImage}' });">View profile</li>`;
                    insideContent += `<li class="li-item" onclick="initialRemoveReservationPopup( { id: ${reservation.reservation.id}, roomId: ${reservation.reservation.roomId},  userFullName: '${reservation.user.fullName}' , startDateTime: '${reservation.reservation.startDateTime}' , endDateTime: '${reservation.reservation.endDateTime}' } );" >Remove reservation</li>`;
                    insideContent += `<li class="li-item" onclick="initialBanUserPopup({ id:${ reservation.user.id } ,  fullName: '${reservation.user.fullName}',  email: '${reservation.user.email}', phoneNumber : '${reservation.user.phoneNumber}', profileImage : '${reservation.user.profileImage}' } ,  { id: ${reservation.reservation.id}, roomId: ${reservation.reservation.roomId},  userFullName: '${reservation.user.fullName}' , startDateTime: '${reservation.reservation.startDateTime}' , endDateTime: '${reservation.reservation.endDateTime}' })">Add to blacklist</li>`;
                    insideContent += `<li class="li-item" onclick=" document.getElementById('dropDownActionMenu${index}').style.display = 'none'; ">Close</li>`;
                    insideContent += `</ul></section>`;
                    insideContent += `</li>`;
                });
                insideContent += '</ul>';
            } else {
                insideContent += `<h4>Don't already have any user's reservation.</h4>`;
            }
            document.getElementById('roomReservationOnSuccessAdminOnSuccess').innerHTML = insideContent;
            document.getElementById('roomReservationOnSuccessAdminOnLoading').style.display = 'none';
            document.getElementById('roomReservationOnSuccessAdminOnSuccess').style.display = 'block';
            document.getElementById('roomReservationOnSuccessAdminOnError').style.display = 'none';
        } else if (result.status == 401) {
            window.location = "/user";
        } else {
            document.getElementById('roomReservationOnSuccessAdminOnLoading').style.display = 'none';
            document.getElementById('roomReservationOnSuccessAdminOnSuccess').style.display = 'none';
            document.getElementById('roomReservationOnSuccessAdminOnError').style.display = 'block';
        }

    } else {
        document.getElementById('roomReservationOnSuccessAdminOnLoading').style.display = 'none';
        document.getElementById('roomReservationOnSuccessAdminOnSuccess').style.display = 'none';
        document.getElementById('roomReservationOnSuccessAdminOnError').style.display = 'block';
    }
}

function initialProfileDataPopup(user){
    let insideContent;
    insideContent = `<section id="popup-user-data">`;
    insideContent += `<img src="/img/${ (user.profileImage != 'null')?user.profileImage : 'user-profile.svg'} " alt="profile image" width="200px;"/>`;
    insideContent += `<p><span class="material-icons">person</span><span>${user.fullName}</span></p>`;
    insideContent += `<p><span class="material-icons">email</span><span>${user.email}</span></p>`;
    insideContent += `<p><span class="material-icons">call</span><span>${user.phoneNumber ?? 'Not Assiged'}</span></p>
    <button class="popup-button popup-button-primary" onclick=" document.getElementById('profileDataPopup').style.display = 'none';">close</span>
        </section>
    `;
    document.getElementById('profileDataPopupContent').innerHTML = insideContent;
    document.getElementById('profileDataPopup').style.display = 'block';
}

function initialRemoveReservationPopup(reservation) {
    document.getElementById('popupOnLoading').style.display = 'nome';
    document.getElementById('popupOnSuccess').style.display = 'none';
    document.getElementById('popupOnError').style.display = 'none';
    document.getElementById('popupOnInitial').style.display = 'block';
    document.getElementById('popupOnInitialHeader').innerHTML = `<h3 class="popup-header">Confirm remove reservation ?</h3>`;
    document.getElementById('popupOnInitialBody').innerHTML = `
        <p>User : ${reservation.userFullName}</p>
        <p>Date :<span> ${getDDMMYYYYFromUtcDateTimeString(reservation.startDateTime)} </span></p>
        <p>Start at :<span>${getHoursFromUtcDateTimeString(reservation.startDateTime)}:00</span></p>
        <p>Untill :<span>${getHoursFromUtcDateTimeString(reservation.endDateTime)}:00</span></p>
    `;
    document.getElementById('popupOnInitialCofirmButton').innerHTML = 'Confirm'
    document.getElementById('popupOnInitialCofirmButton').onclick = function (event) { confirmRemoveReservationPopupHandler(reservation); };
    document.getElementById('popup').style.display = "block";
}

function getHoursFromUtcDateTimeString(dateTime) {
    var list = dateTime.split(/\D/g);
    return list[3];
}

function getDateFromUtcDateTimeString(dateTime) {
    var list = dateTime.split(/\D/g);
    return list[2];
}

function getDDMMYYYYFromUtcDateTimeString(dateTime) {
    var list = dateTime.split(/\D/g);
    return list[2] + '-' + list[1] + '-' + list[0];
}

async function confirmRemoveReservationPopupHandler(reservation) {
    document.getElementById('popupOnLoading').style.display = 'block';
    document.getElementById('popupOnSuccess').style.display = 'none';
    document.getElementById('popupOnError').style.display = 'none';
    document.getElementById('popupOnInitial').style.display = 'none';
    var result = await new Promise((resolve, reject) => {
        try {
            deleteReservation(reservation.id,resolve);
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
                initalUserReservation(reservation.roomId, getDateFromUtcDateTimeString(reservation.startDateTime), getHoursFromUtcDateTimeString(reservation.startDateTime));
            };
        } else if (result.status == 409 || result.status == 410 || result.status == 403 || result.status == 400) {
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

function increaseTimeDutationHandler() {
    var strValue = document.getElementById('durationTime').value;
    var startHour = Number(document.getElementById('startTime').value);
    var hour;
    if (isNaN(strValue)) {
        document.getElementById('durationTime').value = '1';
    } else {
        hour = parseInt(strValue);
        if (hour + startHour < 24) {
            hour++;
            document.getElementById('durationTime').value = hour.toString();
        }
    }
}

function decreaseTimeDutationHandler() {
    var strValue = document.getElementById('durationTime').value;
    var hour;
    if (isNaN(strValue)) {
        document.getElementById('durationTime').value = '1';
    } else {
        hour = parseInt(strValue);
        if (hour > 1) {
            hour--;
            document.getElementById('durationTime').value = hour.toString();
        }
    }
}

function initialBanUserPopup(user,reservation) {
    document.getElementById('popupOnLoading').style.display = 'nome';
    document.getElementById('popupOnSuccess').style.display = 'none';
    document.getElementById('popupOnError').style.display = 'none';
    document.getElementById('popupOnInitial').style.display = 'block';
    document.getElementById('popupOnInitialHeader').innerHTML = `<h3 class="popup-header">Confirm to ban user ?</h3>`;
    document.getElementById('popupOnInitialBody').innerHTML = `
        <p>User : ${user.fullName}</p>
    `;
    document.getElementById('popupOnInitialCofirmButton').innerHTML = 'Confirm'
    document.getElementById('popupOnInitialCofirmButton').onclick = function (event) { confirmBanUserPopupHandler(user, reservation); };
    document.getElementById('popup').style.display = "block";
}

async function confirmBanUserPopupHandler(user,reservation) {
    document.getElementById('popupOnLoading').style.display = 'block';
    document.getElementById('popupOnSuccess').style.display = 'none';
    document.getElementById('popupOnError').style.display = 'none';
    document.getElementById('popupOnInitial').style.display = 'none';
    var result = await new Promise((resolve, reject) => {
        try {
            banUser(user.id, resolve);
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
                initalUserReservation(reservation.roomId, getDateFromUtcDateTimeString(reservation.startDateTime), getHoursFromUtcDateTimeString(reservation.startDateTime));
            };
        } else if (result.status == 409 || result.status == 410 || result.status == 403 || result.status == 400) {
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

function adminSelectHour(roomId, date , timeIndex) {
    document.getElementById(`hourSelect${globalCurrentHourSelect}`).style.color = 'black';
    document.getElementById(`hourSelect${timeIndex}`).style.color = 'red';
    globalCurrentHourSelect = timeIndex;
    initalUserReservation(roomId, date, timeIndex)
}

function getHHMMTimeFromDate(date) {
    return (date.getHours() < 9 ? '0' + date.getHours() : date.getHours()) + ':' + (date.getMinutes() < 9 ? '0' + date.getMinutes() : date.getMinutes());
}