import './App.css'
import './style.css'
import { useState, useEffect } from 'react'
import { loadConfig, initApp, getAllUsers, sendWsHealthCheck, 
  reconnectApp, logoutUser } from './services/utils.ts'
import { handleGetUsers, handleInit, setStateFunctionRefs } from './services/messageHandlers.ts'
import { connectWS } from './services/webSocket.ts'
import ChatList from './components/ChatList.tsx'
import ChatWindow from './components/ChatWindow.tsx'
import LoginDialog from './components/LoginDialog.tsx' 
import NewChatDialog from './components/NewChatDialog.tsx' 
import RegisterDialog from './components/RegisterDialog.tsx' 
import type { User, Message, ChatUsers } from './interfaces.ts';
import { sendGETRequest, sendPOSTRequest, setLoginDialogRef } from './services/restAPI.ts'
import { StatusCodes } from 'http-status-codes'

function App() {
  const [isConfigLoaded, setConfigLoaded] = useState<boolean>(false);
  const [isInitialized, setInitialized] = useState<boolean>(false);
  const [isWsConnected, setWsConnected] = useState<boolean>(false);
  const [showLoginDialog, setShowLoginDialog] = useState<boolean>(false);
  const [showNewChatDialog, setShowNewChatDialog] = useState<boolean>(false);
  const [showRegisterDialog, setShowRegisterDialog] = useState<boolean>(false);
  const [usersRegistered, setUsersRegistered] = useState<User[]>([]);
  // frontend Model:
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatusers, setChatUsers] = useState<ChatUsers[]>([]);
  

  // Config - backend URL for HTTP and WS
  useEffect( () => { 
    loadConfig(setConfigLoaded); 
    setStateFunctionRefs(setInitialized, setUsersRegistered, setCurrentUserId, 
      setCurrentChatId, setMessages, setChatUsers );
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


  /*
  // GET Init - the first message to update clientID - api/initclient
  useEffect( () => { if( isConfigLoaded) initApp(handleInit ); 
      else console.log("Init-Config not loaded yet");
  }, [isConfigLoaded]);
  */

  
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

  /*
  // WS health check message
  useEffect( () => { if( isWsConnected && isInitialized) sendWsHealthCheck(); 
      else console.log("WS not established yet");
    }, [isConfigLoaded, isInitialized, isWsConnected]); 
  */

    const refreshLogin = (isAutoLogin: boolean) => {
      const refreshToken = sessionStorage.getItem('refreshToken');
      sendPOSTRequest('api/auth/refresh', 
        JSON.stringify({ refreshToken }), (jsonResp: any, status: number) => {
          console.log("Response StatusCode: ", status );
          console.log("Response to LoginClick: ", jsonResp );
          switch(status)
          {
            case StatusCodes.OK:
              sessionStorage.setItem('accessToken', jsonResp.accessToken);
              sessionStorage.setItem('refreshToken', jsonResp.refreshToken);
              sessionStorage.setItem("userId", jsonResp.userId.toString());
              setCurrentUserId(jsonResp.userId);
              break;
            case StatusCodes.UNAUTHORIZED:
            case StatusCodes.BAD_REQUEST:
              setShowLoginDialog(!isAutoLogin);
          }
        });
    }
  
  const handleLoginClick = () => { refreshLogin(false) }

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
      <label>
        Logged in as: {usersRegistered.find(u=>u.userId==currentUserId)?.fullname}
      </label>)
    }

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

    <button 
      id="btnNewChat" 
      onClick={() => setShowNewChatDialog(true)}
      disabled={(currentUserId == null)}      
    >
      New Chat
    </button>
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

// TODO: implement user registration
// App opens Reg dlg
// Reg dlg knows login and fullname
  // calls reguser(def. in utils) with handle response (def. in eventHandlers)
    // handle response updates client user model - usersRegistered (def. in App.tsx)

export default App
