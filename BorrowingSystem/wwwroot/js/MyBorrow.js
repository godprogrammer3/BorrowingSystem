window.onload = function () {
    checkDisplayNavigationBar();
    initialMyBorrow();
    var date = new Date();
    document.getElementById('currentTime').innerHTML = getHHMMTimeFromDate(date);
    setInterval(function () {
        document.getElementById('currentTime').innerHTML = getHHMMTimeFromDate(new Date());
    }, 1000);
}

async function initialMyBorrow() {
    if (event) {
        event.preventDefault();
    }
    document.getElementById('bodySectionOnLoading').style.display = 'block';
    document.getElementById('bodySectionOnSuccess').style.display = 'none';
    document.getElementById('bodySectionOnError').style.display = 'none';
    var result = await new Promise((resolve, reject) => {
        try {
            getReservationByUser(resolve);
        } catch (error) {
            console.log('Error ! :', error.message);
            reject(null);
        }

    });
    if (result != null) {
        if (result.status == 200) {
            let reservations = JSON.parse(result.body)
            let insideContent;
            if (reservations.length > 0) {
                insideContent = '<table id="myborrowTable">'
                insideContent += `
                <thead>
                   <tr id="tableHeaderRow">
                     <th class="tableHeader">Name</th>
                     <th  class="tableHeader">Laboratory</th>                     
                     <th  class="tableHeader">Date</th>
                     <th  class="tableHeader">Time</th>
                     <th  class="tableHeader">Action</th>
                    </tr>
                </thead>
                <tbody>
                `;
                reservations.forEach((reservation) => {
                    insideContent += `<tr>`;
                    insideContent += `<td>${reservation.room.equipmentName}</td><td>${reservation.room.name}</td><td>${getDDMMYYYYFromUtcDateTimeString(reservation.reservation.startDateTime)}</td>
                    <td>
                        ${getHoursFromUtcDateTimeString(reservation.reservation.startDateTime)}:00 - ${getHoursFromUtcDateTimeString(reservation.reservation.endDateTime)}:00
                    </td>
                    <td>
                        <span id="deleteIcon" class="material-icons" onclick="initialDeleteReservationPopupContent({  reservationId : ${reservation.reservation.id},  roomName:  '${reservation.room.name}', equipmentName: '${reservation.room.equipmentName}',  startDateTime:  '${reservation.reservation.startDateTime}',  endDateTime: '${reservation.reservation.endDateTime}',});">
                            delete
                        </span>
                    </td>`;
                    insideContent += `</tr>`;
                });

                insideContent += '</tbody></table>';
            } else {
                insideContent = `<h3 id="emptyContentMessage" >You don't have reservation.</h3>`;
            }

            var userDate = JSON.parse(localStorage.getItem('UserData'));
            if (userDate.profileImage != null) {
                document.getElementById('userProfileImage').src = '/img/' + userDate.profileImage;
            } else {
                document.getElementById('userProfileImage').src = '/img/user-profile.svg'
            }
            document.getElementById('bodySectionOnSuccess').innerHTML = insideContent;
            document.getElementById('bodySectionOnLoading').style.display = 'none';
            document.getElementById('bodySectionOnSuccess').style.display = 'flex';
            document.getElementById('bodySectionOnError').style.display = 'none';
        } else if (result.status == 401) {
            window.location = "/user";
        } else {
            document.getElementById('bodySectionOnLoading').style.display = 'none';
            document.getElementById('bodySectionOnSuccess').style.display = 'none';
            document.getElementById('bodySectionOnError').style.display = 'block';
        }

    } else {
        document.getElementById('bodySectionOnLoading').style.display = 'none';
        document.getElementById('bodySectionOnSuccess').style.display = 'none';
        document.getElementById('bodySectionOnError').style.display = 'block';
    }
}

function getHoursFromUtcDateTimeString(dateTime) {
    var list = dateTime.split(/\D/g);
    return list[3];
}

function getDDMMYYYYFromUtcDateTimeString(dateTime) {
    var list = dateTime.split(/\D/g);
    return list[2] +'-'+ list[1] + '-' + list[0];
}

function initialDeleteReservationPopupContent(reservation) {
    document.getElementById('popupOnLoading').style.display = 'nome';
    document.getElementById('popupOnSuccess').style.display = 'none';
    document.getElementById('popupOnError').style.display = 'none';
    document.getElementById('popupOnInitial').style.display = 'block';
    document.getElementById('popupOnInitialHeader').innerHTML = `<h2 id="popupConfirmDeleteHeader">Confirm remove this reservation ?<h2>`;
    document.getElementById('popupOnInitialBody').innerHTML = `
        <div id="popupOnInitialBodyDetail" >
            <div>
                <p><span> ${reservation.roomName} </span><span> ${reservation.equipmentName} </span></p>
                <p>Date :<span> ${getDDMMYYYYFromUtcDateTimeString(reservation.startDateTime)} </span></p>
                <p>Start at :<span> ${getHoursFromUtcDateTimeString(reservation.startDateTime)}:00
                <p>Untill :<span> ${getHoursFromUtcDateTimeString(reservation.endDateTime)}:00 </span></p>
            </div>
        </div>
    `;
    document.getElementById('popupOnInitialCofirmButton').innerHTML = 'Remove'
    document.getElementById('popupOnInitialCofirmButton').onclick = function (event) { confirmDeleteReservationPopupHandler(reservation); };
    document.getElementById('popup').style.display = "block";
}

async function confirmDeleteReservationPopupHandler(reservation) {
    document.getElementById('popupOnLoading').style.display = 'block';
    document.getElementById('popupOnSuccess').style.display = 'none';
    document.getElementById('popupOnError').style.display = 'none';
    document.getElementById('popupOnInitial').style.display = 'none';
    var result = await new Promise((resolve, reject) => {
        try {
            deleteReservation(reservation.reservationId, resolve);
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
                initialMyBorrow();
            };
        }else {
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

function getHHMMTimeFromDate(date) {
    return (date.getHours() < 9 ? '0' + date.getHours() : date.getHours()) + ':' + (date.getMinutes() < 9 ? '0' + date.getMinutes() : date.getMinutes());
}