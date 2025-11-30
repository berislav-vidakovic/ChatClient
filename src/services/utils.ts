import { sendGETRequest, sendPOSTRequest, sendPOSTRequestProtected } from './restAPI.ts'
import { handleUserRegister, 
  handleUserLogin, handleUserLogout, handleNewChatResponse } from './messageHandlers.ts'
import { sendWsMessage } from './webSocket.ts'
import type { User, Message, ChatDisplay, ChatUsers } from '../interfaces.ts';
import type { Dispatch, SetStateAction } from "react";



const currentEnv = import.meta.env.VITE_ENV as string;
export let URL_BACKEND_HTTP = "";
export let URL_BACKEND_WS = ""; 

export async function reconnectApp(){
  console.log("Reconnecting...");
  window.location.reload();
}

export async function disconnectApp(
  setWsConnected:  Dispatch<SetStateAction<boolean>> 
){
  console.log("Disconnecting...");
  setWsConnected(false);
  //window.location.reload();
}


export async function loadConfig(
  setConfigLoaded:  Dispatch<SetStateAction<boolean>> ) {
    try {
        const response = await fetch('/clientsettings.json'); // public dir, level index.html
        if (!response.ok) {
          throw new Error('Failed to fetch configuration');
        }
        const config = await response.json();
        console.log('Loaded config:', config);
        console.log('*** Current running Environment:', currentEnv, '***');
        URL_BACKEND_HTTP = config.urlBackend[currentEnv].HTTP;
        URL_BACKEND_WS = config.urlBackend[currentEnv].WS;
        console.log("URL_BACKEND_HTTP and URL_BACKEND_WS", URL_BACKEND_HTTP, URL_BACKEND_WS);

        setConfigLoaded(true); // Mark configuration as loaded
    } catch (error) {
      console.error('Error loading configuration:', error);
    }
}

export async function initApp(
  handleInit: (data: any) => void
) {
    const endpoint = 'api/initclient';
    sendGETRequest(endpoint, handleInit);
    
    console.log("GET init sent...");
}

export async function getAllUsers(
  handleGetUsers: (data: any, status: number) => void
) {
    sendGETRequest('api/users/all', handleGetUsers);
    console.log("GET users sent...");
}

export async function sendWsHealthCheck() {
    /*
    if( !sessionStorage.getItem("testBreak") ) {
      sessionStorage.setItem("myID", "123");
      sessionStorage.setItem("testBreak", true);
    } */
    const id = sessionStorage.getItem("myID");

    const msg = { type: "healthCheck", status: "WsStatus.Request", data: { id, content: "ping" } };

      // { type = "health", status = "WsStatus.OK", data = new { response = "pong" } }


    const strJson = JSON.stringify(msg);
    console.log("Sending WS message...", strJson);
    sendWsMessage(strJson);
    console.log("WS message sent ...");
}

export async function registerUser(
    login: string, fullname: string, password:string) {
  const body = JSON.stringify({ login, fullname, password } );
  //{ register: { login, fullname } 
  
  sendPOSTRequestProtected('api/users/register', body, handleUserRegister);

  console.log("POST sending: ", body );
}


export async function loginUser(userId: string, password: string) {
  const body = JSON.stringify({ userId, password } );
  
  sendPOSTRequest('api/auth/login', body, handleUserLogin);
  console.log("POST sending: ", body );
}

export async function logoutUser(userId: string) {
  const body = JSON.stringify({ userId } );
  
  sendPOSTRequest('api/auth/logout', body, handleUserLogout);
  console.log("POST sending: ", body );
}

export function createChatList(usersRegistered: User[], chatusers: ChatUsers[], shorten: boolean = false): ChatDisplay[]  {
  
  const chats: ChatDisplay[] = [];
  for( let cu of chatusers ){
    const userNames : string[] = 
      usersRegistered.filter(u=>cu.userIds.includes(u.userId)).map(u=>u.fullname);
    if( !shorten )
      chats.push({chatId: cu.chatId, userNames: userNames.join(',')});     
    else  
      chats.push({chatId: cu.chatId, 
        userNames: userNames.map(u=>u.slice(0,2)).join(',')});
  }
  //console.log(...chats);

  
  return chats;
}


export function sendChatMessage(currentUserId: string | null, 
  currentChatId: string | null, message: string){
  console.log(`Send message: ${message} chatID:${currentChatId} userId:${currentUserId}`);
    //{type="newMessage", status="WsStatus.OK", data = {id,msg,userId,chatId}}
  const id = sessionStorage.getItem("myID");
  const msg = { type: "newMessage", status: "WsStatus.Request", 
    data: { id, 
            userId: currentUserId, 
            chatId: currentChatId,
            msg: message
    } };

  const strJson = JSON.stringify(msg);
  console.log("Sending WS message...", strJson);
  sendWsMessage(strJson);
  console.log("WS message sent ...");
}


export function createNewChat( creatorId: string, selectedUserIds: string[]){
  console.log("Selected users:", selectedUserIds);
  // { creatorId,  memberIds: [userId1,userId2] }
  const msg = { creatorId, memberIds: selectedUserIds };
  const body = JSON.stringify(msg);
  console.log("Sending POST message...", body);

  sendPOSTRequest('api/chat/new', body, handleNewChatResponse);
}