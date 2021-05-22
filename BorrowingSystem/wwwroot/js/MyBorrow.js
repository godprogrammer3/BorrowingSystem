window.onload = function () {
    checkDisplayNavigationBar();
    initialMyBorrow();
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
                insideContent = '<table>'
                insideContent += `
                   <tr>
                     <th>Name</th>
                     <th>Laboratory</th>                     
                     <th>Date</th>
                     <th>Time</th>
                     <th>Action</th>
                    </tr>
                `;
                reservations.forEach((reservation) => {
                    insideContent += `<tr>`;
                    insideContent += `<td>${reservation.equipmentName}</td><td>${reservation.roomName}</td><td>${getDDMMYYYYFromUtcDateTimeString(reservation.startDateTime)}</td>
                    <td>
                        ${getHoursFromUtcDateTimeString(reservation.startDateTime)}:00 - ${getHoursFromUtcDateTimeString(reservation.endDateTime)}:00
                    </td>
                    <td>
                        <span class="material-icons" onclick="initialDeleteReservationPopupContent({  reservationId : ${reservation.reservationId},  roomName:  '${reservation.roomName}', equipmentName: '${reservation.equipmentName}',  startDateTime:  '${reservation.startDateTime}',  endDateTime: '${reservation.endDateTime}',});">
                            delete
                        </span>
                    </td>`;
                    insideContent += `</tr>`;
                });
                insideContent += '</table>';
            } else {
                insideContent = `<h3>Don't already have reservation.</h3>`;
            }
            document.getElementById('bodySectionOnSuccess').innerHTML = insideContent;
            document.getElementById('bodySectionOnLoading').style.display = 'none';
            document.getElementById('bodySectionOnSuccess').style.display = 'block';
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
    document.getElementById('popupOnInitialHeader').innerHTML = `Confirm remove this reservation?`;
    document.getElementById('popupOnInitialBody').innerHTML = `
        <p><span> ${reservation.roomName} </span><span> ${reservation.equipmentName} </span></p>
        <p>Date :<span> ${getDDMMYYYYFromUtcDateTimeString(reservation.startDateTime)} </span></p>
        <p>Start at :<span> ${getHoursFromUtcDateTimeString(reservation.startDateTime)}:00
        <p>Untill :<span> ${getHoursFromUtcDateTimeString(reservation.endDateTime)}:00 </span></p>
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