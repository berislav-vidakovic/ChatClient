import { URL_BACKEND_HTTP, reconnectApp } from './utils.ts';
import { isResetMessageReceived } from './messageHandlers.ts'
import { StatusCodes } from "http-status-codes"
import type { Dispatch, SetStateAction } from 'react';


let setShowLoginDlgRef:  Dispatch<SetStateAction<boolean>>;

export function setLoginDialogRef(
  setShowLoginDlg:  Dispatch<SetStateAction<boolean>>
){
    setShowLoginDlgRef = setShowLoginDlg;
}



export async function sendGETRequestSync(endpoint: string): Promise<any> {
    console.log("Sending GET: ", `${URL_BACKEND_HTTP}/${endpoint}` );
    const response = await fetch(`${URL_BACKEND_HTTP}/${endpoint}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch test cases: ${response.status}`);
    }
    return await response.json(); // Call once - content consumed
}

// Protected Endpoint 2 retries - BEGIN --------------------------------
  // 1-client calls sendPOSTRequestProtected(clientResponseHandler)
  // 2-sendPOSTRequestProtected 
      //- set isFirstRetry = true
      //- call sendPOSTRequest(localReponseHandler)
      //- localReponseHandler check status
        //- if OK  
          //- call clientResponseHandler
        //- if UNAUTHORIZED 
          // if isFirstRetry == false 
            //- raise Login Dialog
            //- call clientResponseHandler 
          //- if isFirstRetry == true 
            //- call sendRefreshTokenRequest(refreshHandleResponse)
            //- refreshHandleResponse check status
              //- if OK 
                //- set isFirstRetry = false
                //- call again sendPOSTRequest(localReponseHandler)
              // - else
                //- raise Login Dialog 
                //- call clientResponseHandler 

function showLoginDialog(){
  //TODO showDialog to enter login & password
  console.log("****************** LOgin with pwd");
  setShowLoginDlgRef(true);
}

async function sendRefreshTokenRequest(
  handleResponse: (data: any, status: number) => void ): Promise<any> {
    const refreshToken = sessionStorage.getItem('refreshToken');  

  sendPOSTRequest('api/auth/refresh', 
    JSON.stringify({ refreshToken }), handleResponse);
}

// Generic POST sending to protected endpoint
export async function sendPOSTRequestProtected(
    endpoint: string, 
    msgBody: string, 
    clientResponseHandler: (data: any, status: number) => void ): Promise<any> {
  
  let isFirstRetry: boolean = true;
  const handleRefreshResponse = ( jsonResp: any, status: number ) =>{
    console.log("*** HANDLE handleRefreshResponse: ", jsonResp);
    if( status == StatusCodes.OK ) {
      isFirstRetry = false;
      sessionStorage.setItem('accessToken', jsonResp.accessToken)
      sessionStorage.setItem('refreshToken', jsonResp.refreshToken)
      // 2nd call
      sendPOSTRequest(endpoint, msgBody, handleResponseLocal);
      return;
    }
    if( status == StatusCodes.UNAUTHORIZED || status == StatusCodes.BAD_REQUEST ){
      showLoginDialog();
    }
  }   

  const handleResponseLocal = ( jsonResp: any, status: number ) => {
    console.log("*** HANDLE handleResponseLocal: ", jsonResp);
    if( status == StatusCodes.OK ) {
      clientResponseHandler(jsonResp, status ); // shortest happy path
      return;
    }
    if( status == StatusCodes.UNAUTHORIZED ){
      console.log("Resp status == StatusCodes.UNAUTHORIZED");
      if( isFirstRetry )
        sendRefreshTokenRequest(handleRefreshResponse);
      else {
        showLoginDialog();
        clientResponseHandler(jsonResp, status );
      }
    }    
  }   
  // 1st call
  sendPOSTRequest(endpoint, msgBody, handleResponseLocal);
}

// Protected Endpoint 2 retries - END ----------------------------------


// Generic GET sending
export async function sendGETRequest(
      endpoint: string, 
      handleResponse: (data: any, status: number) => void ): Promise<any> {
    const getUrl = `${URL_BACKEND_HTTP}/${endpoint}` + `?id=${sessionStorage.getItem("myID")}`;
    console.log("Sending GET: ", getUrl );
    fetch(getUrl, { 
        method: "GET",
        headers: { 
            "Authorization": "Bearer " + sessionStorage.getItem("accessToken"),
            "Content-Type": "application/json" } } ) 
      .then(async (res) => { 
        console.log("...received GET response!");
        const jsonResp = await res.json();
        switch (res.status) {
          case StatusCodes.OK: // 200
          case StatusCodes.CREATED: // 201
          case StatusCodes.UNAUTHORIZED: // 401
          case StatusCodes.BAD_REQUEST: // 400        
            handleResponse( jsonResp, res.status );
            break;
          default:
            throw new Error(`HTTP error! status: ${res.status}`);
        }
      })
      .catch(err => console.error("GET request failed:", err));
}

// Generic POST sending
export async function sendPOSTRequest(
    endpoint: string, 
    msgBody: string, 
    handleResponse: (data: any, status: number) => void ): Promise<any> {
  const postUrl = `${URL_BACKEND_HTTP}/${endpoint}` + `?id=${sessionStorage.getItem("myID")}`;
  console.log("Sending POST: ", `${postUrl} Body:${msgBody}` );
  fetch( postUrl, {
          method: "POST",
          headers: { 
            "Authorization": "Bearer " + sessionStorage.getItem("accessToken"),
            "Content-Type": "application/json" },
          body: msgBody }) 
    .then(async (res) => { 
      console.log("...received POST response!");
      const jsonResp = await res.json();
      switch (res.status) {
        case StatusCodes.OK: // 200
        case StatusCodes.CREATED: // 201
        case StatusCodes.UNAUTHORIZED: // 401
        case StatusCodes.BAD_REQUEST: // 400        
          handleResponse( jsonResp, res.status );
          break;
        default:
          throw new Error(`HTTP error! status: ${res.status}`);
      }
    })
    .catch(err => console.log("POST request failed:", err));
}



