import { URL_BACKEND_HTTP, reconnectApp } from './utils.ts';
import { isResetMessageReceived } from './messageHandlers.ts'
import { StatusCodes } from "http-status-codes"


export async function sendGETRequestSync(endpoint: string): Promise<any> {
    console.log("Sending GET: ", `${URL_BACKEND_HTTP}/${endpoint}` );
    const response = await fetch(`${URL_BACKEND_HTTP}/${endpoint}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch test cases: ${response.status}`);
    }
    return await response.json(); // Call once - content consumed
}

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

export async function sendRefreshTokenRequest(
  handleResponse: (data: any, status: number) => void ): Promise<any> {
    const refreshToken = sessionStorage.getItem('refreshToken');  

    sendPOSTRequest('api/auth/refresh', 
      JSON.stringify({ refreshToken }), 
      handleResponse);
}

