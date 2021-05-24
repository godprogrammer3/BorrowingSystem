window.onload = function(){
    document.getElementById("form").addEventListener("submit",(event,context = this)=>submitFormHandler(event,context));
}
async function submitFormHandler(event, context) {

    event.preventDefault();
    var fullName = document.getElementById('fullName').value;
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    document.getElementById('registerLoader').style.display = "block";
    document.getElementById('registerSubmitButton').style.display = "none";
    new Promise((resolve, reject) => {
        try {
            register(email, password, fullName, resolve);
        } catch (error) {
            reject({ status: -1, message: error.message });
        }
    }).then(data => {
        document.getElementById('registerLoader').style.visibility = "hidden";
        if (data.status == 204) {
            console.log('Success.');
            window.location = "/user";
        } else {
            console.log('Error!');
            alert('Unknow error!');
            document.getElementById('registerLoader').style.display = "none";
            document.getElementById('registerSubmitButton').style.display = "block";
        }
        
    }).catch(error => {
        console.log('Error :', error.message);
        alert('Unknow error!');
        document.getElementById('registerLoader').style.display = "none";
        document.getElementById('registerSubmitButton').style.display = "block";
    });
}
