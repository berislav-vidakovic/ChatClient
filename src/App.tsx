import './App.css'
import './style.css'
import { useState, useEffect } from 'react'
import { loadConfig, getAllUsers, reconnectApp, logoutUser } from './services/utils.ts'
import { handleGetUsers, parseAndUpdateModel, setStateFunctionRefs } from './services/messageHandlers.ts'
import { connectWS } from './services/webSocket.ts'
import { userHasClaim } from './services/rbac.ts'

import ChatList from './components/ChatList.tsx'
import ChatWindow from './components/ChatWindow.tsx'
import LoginDialog from './components/LoginDialog.tsx' 

import UsersDialog from './components/UsersDialog' 
import NewChatDialog from './components/NewChatDialog.tsx' 
import RegisterDialog from './components/RegisterDialog.tsx' 
import type { User, Message, ChatUsers, Role  } from './interfaces.ts';
import  { CLAIMS } from './interfaces.ts';
import { sendGETRequest, sendPOSTRequest, setLoginDialogRef } from './services/restAPI.ts'
import { StatusCodes } from 'http-status-codes'

function App() {
  const [isConfigLoaded, setConfigLoaded] = useState<boolean>(false);
  const [isInitialized, setInitialized] = useState<boolean>(false);
  const [isWsConnected, setWsConnected] = useState<boolean>(false);
  const [showLoginDialog, setShowLoginDialog] = useState<boolean>(false);
  const [showNewChatDialog, setShowNewChatDialog] = useState<boolean>(false);
  const [showUsersRoles, setShowUsersRoles] = useState<boolean>(false);
  const [showRegisterDialog, setShowRegisterDialog] = useState<boolean>(false);
  const [usersRegistered, setUsersRegistered] = useState<User[]>([]);
  // frontend Model:
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserClaims, setCurrentUserClaims] = useState<string[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatusers, setChatUsers] = useState<ChatUsers[]>([]);

  // Config - backend URL for HTTP and WS
  useEffect( () => { 
    loadConfig(setConfigLoaded); 
    setStateFunctionRefs(setInitialized, setUsersRegistered, setCurrentUserId, 
      setCurrentChatId, setMessages, setChatUsers, setCurrentUserClaims, setAvailableRoles );
    setLoginDialogRef(setShowLoginDialog);
  }, []);

  // GET Ping and pingdb 
  useEffect( () => { if( isConfigLoaded) {
    sendGETRequest('api/ping', handlePingResponse);
    sendGETRequest('api/pingdb', handlePingDbResponse);    
    } 
    else console.log("Ping-Config not loaded yet");
  }, [isConfigLoaded]);

  function handlePingResponse( jsonResp: any ) {
    console.log("Response to GET PING: ", jsonResp );
  }

  function handlePingDbResponse( jsonResp: any ) {
    console.log("Response to GET PINGDB: ", jsonResp );
  } 
  
  // 1. isConfigLoaded
  // 2. isInitialized
  // 3. isWsConected

  // GET users /api/users/all
  useEffect( () => { if( isConfigLoaded ) getAllUsers(
      handleGetUsers); 
      else console.log("GET-Config not loaded yet");
    }, [isConfigLoaded]);  
      
 
  // WS connect
  useEffect( () => { if( isConfigLoaded && isInitialized ) {
      connectWS(setWsConnected); 
    }
      else console.log("WS-Config not loaded yet or not initialized");
  }, [isConfigLoaded, isInitialized]);

  // Auto login
  useEffect( () => { if( isWsConnected && isInitialized ) {
      refreshLogin(true);
    }
      else console.log("Not initialized and/or WS not connected yet");
  }, [isWsConnected, isInitialized]);

    const refreshLogin = (isAutoLogin: boolean) => {
      const refreshToken = sessionStorage.getItem('refreshToken');
      sendPOSTRequest('api/auth/refresh', 
        JSON.stringify({ refreshToken }), (jsonResp: any, status: number) => {
          //console.log("Response StatusCode: ", status );
          //console.log("Response to LoginClick: ", jsonResp );
          switch(status)
          {
            case StatusCodes.OK:
              parseAndUpdateModel(jsonResp);
              break;
            case StatusCodes.UNAUTHORIZED:
            case StatusCodes.BAD_REQUEST:
              console.log("BAD REQUEST, isAutoLogin=", isAutoLogin);
              setShowLoginDialog(!isAutoLogin);
          }
        });
    }
  
  const handleLoginClick = () => { refreshLogin(false) }

  const isUserHavingClaim = (claim: string) => {
    return userHasClaim(claim, 
      currentUserId, usersRegistered, availableRoles );
  }


  return (
    <main className="app-container">
      <header className="top-bar">

  <div className="left-group">
    <button 
      id="btnConnect" 
      className="icon-button"
      onClick={ () => {
          console.log("Refresh clicked!");
          reconnectApp();
        }
      }
      disabled={isWsConnected}
    >
      Connect
    </button>

    <button 
      id="btnLogin" 
      onClick={() => handleLoginClick() }
      disabled={(currentUserId != null) || !isWsConnected}
    >
      Login
    </button>

    <button 
      id="btnRegister" 
      onClick={() => setShowRegisterDialog(true)}
      disabled={(currentUserId != null) || !isWsConnected}
    >
      Register
    </button>

    {currentUserId && (
      <div>
        <div>
          Logged in as: {usersRegistered.find(u=>u.userId==currentUserId)?.fullname}
        </div>
        {/*
        <div>Claims: {
          <label>  
            {currentUserClaims.join(', ')}
          </label>
        }
        </div>  
        */}
      </div> )}

  </div>

  <div className="right-group" style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
    <button 
      id="btnLogout" 
      onClick={() => { 
        console.log("Logout clicked!");
        logoutUser(currentUserId as string);
      } }
      disabled={(currentUserId == null)}
    >
      Logout
    </button>

      {isUserHavingClaim(CLAIMS.CREATE_CHAT) && (
      <button 
        id="btnNewChat" 
        onClick={() => setShowNewChatDialog(true)}
        disabled={(currentUserId == null)}      
      >
        New Chat
      </button>
      )}
      {isUserHavingClaim(CLAIMS.MANAGE_USERS) && (
       <button 
          id="btnUserRoles" 
          onClick={() => setShowUsersRoles(true)}
          disabled={(currentUserId == null)}
        >
          Users and Roles
        </button>
      )}
  </div>

</header>


      {(
        <div className="main-frame">
          {(
            <ChatList
              usersRegistered={usersRegistered}
              chatusers = {chatusers}
              currentChatId = {currentChatId}
              setCurrentChatId = {setCurrentChatId}
              isWsConnected={isWsConnected}
              messages={messages}
            />
          )}

          {( 
          <ChatWindow
              usersRegistered = {usersRegistered}
              currentUserId = {currentUserId}
              currentChatId = {currentChatId} 
              messages = {messages} 
              chatusers={chatusers}
          />  
          ) }
        </div>
      )}

      {showLoginDialog && usersRegistered.some(u=>!u.isonline) && (
        <LoginDialog
          setShowLoginDialog={setShowLoginDialog}
          usersRegistered={usersRegistered}  
          isWsConnected={isWsConnected}  
        />
      )}

      {showUsersRoles && (
        <UsersDialog
          setShowUsersRoles={setShowUsersRoles}
          usersRegistered={usersRegistered}  
          isWsConnected={isWsConnected}  
          availableRoles={availableRoles}
        />
      )}

      {showNewChatDialog && (
        <NewChatDialog
          setShowNewChatDialog={setShowNewChatDialog}
          usersRegistered={usersRegistered}
          currentUserId = {currentUserId as string}
        />
      )}

      {showRegisterDialog && (
        <RegisterDialog
          isWsConnected={isWsConnected}  
          setShowRegisterDialog={setShowRegisterDialog}
        />
      )}

    </main>
  );
}

export default App
