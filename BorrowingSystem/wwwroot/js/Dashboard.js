

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
    document.getElementById('roomDetailAvailableSectionOnLoading').style.display = 'block';
    document.getElementById('roomDetailAvailableSectionOnSuccess').style.display = 'none';
    document.getElementById('roomDetailAvailableSectionOnError').style.display = 'none';
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
        let insideContent;
        if (days.length > 0) {
            insideContent = `
                <span>${room.name}</span>
                <span>${room.equipmentName}</span>
                <h4>${ new Date().toLocaleDateString("en-US") }</h4>
                <section style="display:flex;">
            `;
            var nowDate = new Date();
            nowDate = nowDate.getDate();
            var firstDateOfWeek = nowDate - days[nowDate - 1].dayOfWeek + 1;
            for (var countDay = 0; countDay < 7; countDay++) {
                insideContent += `<span><section><p>`;
                insideContent += dayOfWeekToString(days[firstDateOfWeek-1].dayOfWeek) + '</p>';
                insideContent += `<p>${firstDateOfWeek}</p>`;
                insideContent += `</section></span>`;
                firstDateOfWeek++;  
            }
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
        document.getElementById('roomDetailAvailableSectionOnSuccess').innerHTML = insideContent;
        document.getElementById('roomDetailAvailableSectionOnLoading').style.display = 'none';
        document.getElementById('roomDetailAvailableSectionOnSuccess').style.display = 'block';
        document.getElementById('roomDetailAvailableSectionOnError').style.display = 'none';
    } else {
        document.getElementById('roomDetailAvailableSectionOnLoading').style.display = 'none';
        document.getElementById('roomDetailAvailableSectionOnSuccess').style.display = 'none';
        document.getElementById('roomDetailAvailableSectionOnError').style.display = 'block';
    }
}

function dayOfWeekToString( dayOfWeek ) {
    var listDays = [        
        'Su',
        'Mo',
        'Tu',
        'We',
        'Th',
        'Fr',
        'Sa'
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