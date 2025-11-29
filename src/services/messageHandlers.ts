// messageHandlers.ts
import type { User, Message, ChatUsers } from '../interfaces.ts';
import type {  Dispatch, SetStateAction } from "react";
import { reconnectApp  } from './utils.ts';
import { StatusCodes } from "http-status-codes"

let setInitializedRef:  Dispatch<SetStateAction<boolean>>;
let setUsersRegisteredRef:  Dispatch<SetStateAction<User[]>>;
let setCurrentUserIdRef:  Dispatch<SetStateAction<string | null>>; 
let setCurrentChatIdRef:  Dispatch<SetStateAction<string | null>>; 
let setMessagesRef:  Dispatch<SetStateAction<Message[]>>; 
let setChatUsersRef:  Dispatch<SetStateAction<ChatUsers[]>>; 

export function setStateFunctionRefs(
  setInitialized:  Dispatch<SetStateAction<boolean>>,
  setUsersRegistered:  Dispatch<SetStateAction<User[]>>,
  setCurrentUserId:  Dispatch<SetStateAction<string | null>>,
  setCurrentChatId:  Dispatch<SetStateAction<string | null>>,
  setMessages:  Dispatch<SetStateAction<Message[]>>,
  setChatUsers:  Dispatch<SetStateAction<ChatUsers[]>>
){
    setInitializedRef = setInitialized;
    setUsersRegisteredRef = setUsersRegistered;
    setCurrentUserIdRef = setCurrentUserId;
    setCurrentChatIdRef = setCurrentChatId;
    setMessagesRef = setMessages;
    setChatUsersRef = setChatUsers;
}

export function handleInit( jsonResp: any ) {
  setInitializedRef(true);
  console.log("Response to GET INIT: ", jsonResp );
  sessionStorage.setItem("myID", jsonResp.id);
}

export function handleGetUsers( jsonResp: any, status: number ) {
  // Map API response fields to match your User interface
  console.log("Response to GET users: ", jsonResp );
  
  sessionStorage.setItem("myID", jsonResp.id);

  if( status == StatusCodes.OK ){
    const mappedUsers: User[] = jsonResp.users.map((u: any) => ({
      userId: u.id,
      login: u.login,
      fullname: u.fullName,  
      isonline: u.isOnline   
    }));
    console.log("MAPPED Users: ", mappedUsers );

    // Update React state - ref. to setUsersRegistered defined in App.tsx
    setInitializedRef(true);
    setUsersRegisteredRef(mappedUsers);
  }
}

function updateModel(userId: string | null, messages: Message[], chatId: string | null, chatusers: ChatUsers[]){
  setCurrentUserIdRef(userId);
  sessionStorage.setItem("userId", String(userId));
  console.log("****** updateModel - setCurrentUserIdRef", userId, " messages: ", messages);

  setMessagesRef(messages);  
  setCurrentChatIdRef( chatId);
  setChatUsersRef(chatusers);

  sessionStorage.setItem("chatId", String(chatId));
}

export function isResetMessageReceived( jsonResp: any ) : boolean {
  //console.log("Message: ", jsonResp);
  const newID = jsonResp.reset; 
  if( newID ){
    sessionStorage.setItem("myID", newID);
    return true;
  }
  return false;
}

export function handleUserRegister( jsonResp: any, status: number ){
  console.log("*** HANDLE User registered: ", jsonResp);
  if( jsonResp.acknowledged ) {     
    console.log("User registered: ", jsonResp.user);
  }
  else {
    console.log("User NOT registered: ", jsonResp.error);
    alert("NOT registered: User already exists");
  }
}

export function handleUserLogin( jsonResp: any, status: number ){
  console.log("******** ****** POST response handleUserLogin received: ", jsonResp); 
  // Response: { userId, isOnline, accessToken, refreshToken }
  console.log("******** ****** POST response handleUserLogin received: ", 
      jsonResp, "Status: ", status); 
  if( status == StatusCodes.OK ){
    setCurrentUserIdRef(jsonResp.userId);
    sessionStorage.setItem("accessToken", jsonResp.accessToken);
    sessionStorage.setItem("refreshToken", jsonResp.refreshToken);
    sessionStorage.setItem("userId", jsonResp.userId.toString());
    console.log("Login OK", jsonResp);
    parseAndUpdateModel(jsonResp);
  }
}

export function parseAndUpdateModel( jsonResp: any){
  // Response: {userOnline: true, userId: 2, 
  //    messages: [{id,chatId,userId,datetime,text}], 
  //    chats: [{id,userIds:[u1,u2], chatName}]
  
  // update messages {messageId: 6, chatId: 3, userId: 2, timestamp: '2025-10-18T11:22:34', text: 'New message'}
  if ( !Array.isArray(jsonResp.messages) ) return;  
  const messages: Message[] = jsonResp.messages.map((m: any) => ({
    msgId: m.id,
    chatId: m.chatId,
    userId: m.userId,
    datetime: new Date(m.datetime),
    text: m.text }));
  console.log("Received messages: ", ...messages);
  
 
  // update chats [{ "chatId": 1, "userIds": [5, 7, 9], "name" }]  
  if (!Array.isArray(jsonResp.chats)  ) return;  
  const chatusers: ChatUsers[] = jsonResp.chats.map((cu: any) => ({
    chatId: cu.id,
    userIds: cu.userIds,
    name: cu.chatName
  })); 
  console.log("Received chatUsers: ", ...chatusers);

  //const chatId : number | null  = messages.length ? Math.min(...messages.map((m: Message) => m.chatId)) : null;
  //const chatId : string | null  = chatusers.length ? Math.min( ...chatusers.map(cu=>cu.chatId)) : null;
  const chatId : string | null  = chatusers.length ? chatusers[0].chatId : null;
  console.log(" ******** ****** MODEL update: with chatId: ", chatId);
  updateModel( jsonResp.userId, messages, chatId, chatusers );  
}

export function handleUserLogout( jsonResp: any, status: number ){
  console.log("Logout POST response received: ", jsonResp); 
  // Response: {userOnline: false, userId: 2}  
  //updateModel( null, [], null, [] );  
  if( status == StatusCodes.OK ) {
    setCurrentUserIdRef(null);
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("accessToken" );
    sessionStorage.removeItem("refreshToken" );
  }
}

export  function handleNewChatResponse( jsonResp: any, status: number ) {
  if( status == StatusCodes.OK ) {
    console.log("EXISTING CHAT: ", jsonResp.newChatId, "USERs:", ...jsonResp.userIds);
    setCurrentChatIdRef(jsonResp.newChatId);
  }
  else if( status == StatusCodes.CREATED )
    console.log("NEW CHAT: ", jsonResp.newChatId, "USERs:", ...jsonResp.userIds);
}

// -------------- WS message handlers ------------------------------------------
export async function handleWsMessage( jsonMsg: any ) {
   if( isResetMessageReceived(jsonMsg.data) ){
        alert("*** WS isResetMessageReceived ******************");
        reconnectApp();
        return;
   }        
  console.log("WS Message received:", jsonMsg );
   //{ type = "health", status = "WsStatus.OK", data = new { response = "pong" } }

  // { type = "userRegister", status = "WsStatus.OK", data = { acknowledged = true, user = newUser } };
  if( jsonMsg.type== "userRegister" )
    handleWsUserRegister(jsonMsg.data);
  else if( jsonMsg.type == "userSessionUpdate")
    handleWsUserSessionUpdate(jsonMsg.data);   
  else if( jsonMsg.type == "userRestoreLogin") // { data = new { userId, chatId, messages  } }
    handleWsUserRestoreLogin( jsonMsg.data);
  else if( jsonMsg.type == "newMessage") //  { type = "newMessage", status = "WsStatus.OK", data = new { senderId= userId, userIds } };
    handleWsNewMessageSent( jsonMsg.data );
  else if( jsonMsg.type == "newChatCreated" )
    handleWsNewChatCreated( jsonMsg.data );
}

function handleWsNewChatCreated( jsonMsgData: any ){
  console.log("*** handleWsNewChatCreated *** ");
  // { newChatId, userIds, creatorId }
  const myUserID : number = Number(sessionStorage.getItem("userId"));
  if ( Number.isNaN(myUserID)) return; // no current user
  if ( !jsonMsgData.userIds.includes(myUserID) ) return; // current user is not a participant
  const creatorId: number = jsonMsgData.creatorId;
  
  // creator - update model with currentChatId = newChatId
  // participant - update model with current ChatId unchanged or newChatId if no currentChat
  let currentChatID : number = Number(sessionStorage.getItem("chatId"));
  if ( Number.isNaN(currentChatID) || creatorId == myUserID ) 
    currentChatID = jsonMsgData.newChatId;

  const newChat : ChatUsers = {
    chatId: currentChatID,
    userIds: jsonMsgData.userIds
  };

    // append new chat
  setChatUsersRef(prevCU => [...prevCU, newChat]);

  // update messages
  setMessagesRef([]);

  // update current chatId
  setCurrentChatIdRef(currentChatID);
  sessionStorage.setItem( "chatId", String(currentChatID ));
}

function handleWsUserRestoreLogin(jsonMsgData: any ){
  console.log( "RESTORE: ", jsonMsgData );
    // Response: {userOnline: true, userId: 2, messages: [{},{}] }
 
  // update messages {messageId: 6, chatId: 3, userId: 2, timestamp: '2025-10-18T11:22:34', text: 'New message'}
  if (!Array.isArray(jsonMsgData.messages)  ) return;  
  const messages: Message[] = jsonMsgData.messages.map((m: any) => ({
    msgId: m.messageId,
    chatId: m.chatId,
    userId: m.userId,
    datetime: new Date(m.timestamp),
    text: m.text }));

    // update chats [{ "chatId": 1, "userIds": [5, 7, 9] }]  
  if (!Array.isArray(jsonMsgData.chatUsers)  ) return;  
  const chatusers: ChatUsers[] = jsonMsgData.chatUsers.map((cu: any) => ({
    chatId: cu.chatId,
    userIds: cu.userIds 
  })); 
  console.log("WS-restore-Received chatUsers: ", ...chatusers);

    console.log(" ******** ****** MODEL update: ", jsonMsgData.userId, messages, jsonMsgData.chatId );
    updateModel( jsonMsgData.userId, messages, jsonMsgData.chatId, chatusers );  
}

async function  handleWsNewMessageSent( jsonMsgData: any ){
  //  { type = "newMessage", status = "WsStatus.OK", data = new { senderId= userId, userIds, msg } };
  console.log("handleNewMessageSent:", jsonMsgData.senderId, jsonMsgData.userIds, jsonMsgData.msg );

  const message = {
    msgId: jsonMsgData.msg.messageId,
    chatId: jsonMsgData.msg.chatId,
    userId: jsonMsgData.msg.userId,
    datetime: new Date(jsonMsgData.msg.timestamp),
    text: jsonMsgData.msg.text };
  
    //const [messages, setMessages] = useState<Message[]>([]);
    // append new message
    setMessagesRef(prevMessages => [...prevMessages, message]);
  
}

async function handleWsUserSessionUpdate( jsonMsgData: any ) {
  console.log("*** Ws-HANDLE User session update: ", jsonMsgData);
  
  // { type: "userSessionUpdate", status: "WsStatus.OK", data: { userId: 1, isOnline: false } }
  const userId = jsonMsgData.userId;
  const isOnline = jsonMsgData.isOnline;    
  setUsersRegisteredRef(prev =>
    prev.map(u =>
      u.userId === userId
        ? { ...u, isonline: isOnline }  // update online status
        : u
    )
  );
  // Handle the forced logout for the current user logged in 
  const storedCurrentUserId = sessionStorage.getItem("userId");
  if( !isOnline && userId == storedCurrentUserId ) {
    console.log( "******** FORCING Logout .... **********");
    updateModel( null, [], null, [] );  
  }
}

export function handleWsUserRegister( jsonResp: any ){
  console.log("*** Ws-HANDLE User registered: ", jsonResp);
  if( jsonResp.acknowledged ) { 
    // Construct the new user object
    const newUser: User = {
      userId: jsonResp.user.id,
      login: jsonResp.user.login,
      fullname: jsonResp.user.fullName,
      isonline: jsonResp.user.isOnline,
    };
    // Update frontend state (append to existing users list)    
    setUsersRegisteredRef(prev => {
      const dupe = prev.some(u => u.userId === newUser.userId);
      if( dupe ) console.log("=====================Duplicate ID found, no user appending");
      return dupe ? prev : [...prev, newUser];
    });

    console.log("Ws-User registered: ", jsonResp.user);
  }
  else {
    console.log("User NOT registered: ", jsonResp.error);
    alert("NOT registered: User already exists");
  }
}
