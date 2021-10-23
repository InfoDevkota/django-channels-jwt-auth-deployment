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


        connectChatSocket();
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

        document.getElementById("chatBox").style.display = 'block';
    } else {
        document.getElementById("myInfo").style.display = 'none';
        document.getElementById("chatBox").style.display = 'none';
        document.getElementById("loginRegister").style.display = 'block';
    }
}

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



// now chat

let chatSocket;

const connectChatSocket = () =>{
    let ws_scheme = window.location.protocol == "https:" ? "wss://" : "ws://";
    console.log(ws_scheme);

    chatSocket = new WebSocket(
        ws_scheme
        + window.location.host
        + '/ws/chat/?token='+token
    );

    chatSocket.onopen = event =>{
        console.log("chat Socket connected..")
    }

    chatSocket.onmessage = (e) =>{
        let response = JSON.parse(e.data);

        // console.log(response);

        let type = response.type;

        if(type == 'message') {
            showMessage(response.data.message);
        }

        if(type == 'noAuth') {
            //lets clear 
            logout();
        }

        if(type == 'newMessage') {
            console.log(response.data);

            let messageDiv = getAMessageHTML(
                response.data.sender.name,
                response.data.sender.userName,
                response.data.message,
                response.data.date
            );

            document.getElementById("messageHolder").appendChild(messageDiv);
        }
    }
}

const sendMessage = () =>{
    let message = document.getElementById("messageText").value;
    // console.log(message, message.length);
    if(message.length>0) {
        chatSocket.send(JSON.stringify({
            type: 'message',
            data: {
                message: message
            }
        }));
        document.getElementById("messageText").value = "";
    }
}


const getAMessageHTML = (name, userName, message, date) => {
    // <div class="a-message">
    //     <div class="a-message-name">
    //        <span>▣</span>
    //        <span> Name</span>
    //     </div>
    //     <div class="a-message-message">
    //         Message Message Message Message Message Message Message Message Message Message Message
    //         Message Message Message Message Message Message Message Message Message Message Message
    //         Message Message Message Message
    //     </div>
    //     <div class="a-message-date">
    //         Date
    //     </div>
    // </div>

    let outerDiv = document.createElement('div');
    outerDiv.classList.add('a-message');

    let nameDiv = document.createElement('div');
    nameDiv.classList.add('a-message-name');

    let nameSpan = document.createElement('span');
    nameSpan.innerText = ` ${name} (${userName})` ;
    nameDiv.appendChild(nameSpan);

    outerDiv.appendChild(nameDiv);

    let messageDiv = document.createElement('div');
    messageDiv.classList.add('a-message-message');
    messageDiv.innerText = message;
    outerDiv.appendChild(messageDiv);

    let dateDiv = document.createElement('div');
    dateDiv.classList.add('a-message-date');
    dateDiv.innerText = new Date(date).toLocaleTimeString()+ ", " + new Date(date).toDateString();
    outerDiv.appendChild(dateDiv);

    return outerDiv;
}



readLocalStore();