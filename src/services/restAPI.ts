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
export async function sendGETRequest(endpoint: string, handleResponse: (data: any) => void ): Promise<any> {
    const getUrl = `${URL_BACKEND_HTTP}/${endpoint}` + `?id=${sessionStorage.getItem("myID")}`;
    console.log("Sending GET: ", getUrl );
    fetch(getUrl, { 
        method: "GET",
        credentials: "include" // required for cookies
      } ) 
      .then( async(res) => { // this returns a Promise that resolves with parsed JSON
        if (!res.ok) { 
          const errorText = await res.text();
          throw new Error(`${res.status}: ${errorText || res.statusText}`);
        }
        console.log("...received GET response!");
        return res.json();
      })
      .then( (jsonResp) => {          
        if( isResetMessageReceived(jsonResp) )
          reconnectApp();
        else
          handleResponse( jsonResp );
      } )  // runs after parsing completes
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
          headers: { "Content-Type": "application/json" },
          body: msgBody, 
  }) 
    .then(async (res) => { 
      console.log("...received POST response!");
      const jsonResp = await res.json();
      
      switch (res.status) {
        case StatusCodes.OK: // 200
        case StatusCodes.CREATED: // 201
        case StatusCodes.RESET_CONTENT: // 205
          handleResponse( jsonResp, res.status );
        //case StatusCodes.BAD_REQUEST: // 400
        //case StatusCodes.CONFLICT: // 409
          break;
        default:
          throw new Error(`HTTP error! status: ${res.status}`);
      }
      /*
      if( isResetMessageReceived(jsonResp) )
        reconnectApp();
      else
        handleResponse( jsonResp );
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);*/

    })
    .catch(err => console.log("POST request failed:", err));
}



