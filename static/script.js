console.log("script.js attached. !!")

let isLogin = false;
let token;
let user;

const readLocalStore = () =>{
    let login = localStorage.getItem('isLogin');
    if(login) {
        isLogin = true;
        token = localStorage.getItem("token");
        user = JSON.parse(localStorage.getItem("user"));
        console.log(isLogin, token, user);
    } else {
        isLogin = false;
        token = null;
        user = null
    }

    if(isLogin) {
        document.getElementById("myInfo").style.display = 'block';
        document.getElementById("loginRegister").style.display = 'none';
    
        document.getElementById("myUserName").innerText = user.user_name;
        document.getElementById("myName").innerText = user.name;
    } else {
        document.getElementById("myInfo").style.display = 'none';
        document.getElementById("loginRegister").style.display = 'block';

    }
}

readLocalStore();



let authSocket;

const connectAuthSocket = (cb) =>{
    let ws_scheme = window.location.protocol == "https:" ? "wss://" : "ws://";
    console.log(ws_scheme);

    authSocket = new WebSocket(
        ws_scheme
        + window.location.host
        + '/ws/auth/'
    );

    authSocket.onopen = event =>{
        console.log("auth Socket connected..")
        if(cb) {
            cb();
        }
    }

    authSocket.onmessage = (e) =>{
        let response = JSON.parse(e.data);

        // console.log(response);

        let type = response.type;

        if(type == 'message') {
            showMessage(response.data.message);
        }

        if(type == "loginInfo") {
            showMessage(response.data.message);

            localStorage.setItem("isLogin", true)
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.user));

            // will show userInfo and hide login register
            readLocalStore();
        }
    }
}

const register = () =>{
    console.log("Register.")
    let name = document.getElementById("register_name").value;
    let userName = document.getElementById("register_user_name").value;
    let userPassword = document.getElementById("register_password").value
    // console.log("Register.", name, userName, userPassword)

    const sendRegisterInfo = () =>{
        authSocket.send(JSON.stringify({
            type: 'register',
            data: {
                name: name,
                userName: userName,
                password: userPassword
            }
        }));
    }

    if(!authSocket) {
        // is not connected, let's pass callback, so when connected
        // cb will be triggered

        connectAuthSocket(sendRegisterInfo)
    } else {
        // socket is already connected so, let's just trigger
        sendRegisterInfo();
    }
}


const login = () =>{
    let userName = document.getElementById("login_user_name").value;
    let userPassword = document.getElementById("login_password").value
    // console.log("Login.", userName, userPassword)

    const sendLoginInfo = () =>{
        authSocket.send(JSON.stringify({
            type: 'login',
            data: {
                userName: userName,
                password: userPassword
            }
        }));
    }

    if(!authSocket) {
        connectAuthSocket(sendLoginInfo)
    } else {
        sendLoginInfo();
    }
}

let messageTimeOut;
const showMessage = (message) =>{
    if(messageTimeOut) {
        clearTimeout(messageTimeOut)
    }
    document.getElementById("InfoMessage").innerText = message;
    messageTimeOut = setTimeout(()=>{
        document.getElementById("InfoMessage").innerText = "";
        messageTimeOut = null;
    }, 3000);
}

const logout = () => {
    localStorage.removeItem("isLogin");
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    readLocalStore();
}
