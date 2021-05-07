window.onload = function(){
    document.getElementById("form").addEventListener("submit",(event,context = this)=>submitFormHandler(event,context));
}
async function submitFormHandler(event, context) {

    event.preventDefault();
    var fullName = document.getElementById('fullName').value;
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    document.getElementById('loader').style.visibility = "visible";
    new Promise((resolve, reject) => {
        try {
            register(email, password, fullName, resolve);
        } catch (error) {
            reject({ status: -1, message: error.message });
        }
    }).then(data => {
        document.getElementById('loader').style.visibility = "hidden";
        if (data.status == 204) {
            console.log('Success.');
            window.location = "/user";
        } else {
            console.log('Error!');
        }
        
          
    }).catch(error => {
        document.getElementById('loader').style.visibility = "hidden";
        console.log('Error :', error.message);
    });
}
