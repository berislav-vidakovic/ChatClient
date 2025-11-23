// RegisterDialog.tsx
import type { Dispatch, SetStateAction } from "react";
import type { User } from '../interfaces.ts'
import { useRef, useEffect } from "react";
import { registerUser } from "../services/utils.ts";


function RegisterDialog({
    isWsConnected, setShowRegisterDialog
  }: {
    isWsConnected: boolean;
    setShowRegisterDialog: Dispatch<SetStateAction<boolean>>;
  }) {

  useEffect(() => {
    (document.querySelector("#inputLogin") as HTMLElement | null)?.focus();
  }, []);

  // Refs to access DOM input values
  const loginRef = useRef<HTMLInputElement>(null);
  const fullnameRef = useRef<HTMLInputElement>(null);

  const handleConfirmClick = () => {
    if (!isWsConnected) {
      alert("You are disconnected.");
      setShowRegisterDialog(false);    
      return;
    }  
    const login: string = loginRef.current?.value.trim() ?? "";
    const fullname: string = fullnameRef.current?.value.trim() ?? "";
    console.log("Entered values:", { login, fullname });      
    if (!login || !fullname) {
      alert("Please fill in both fields.");
      return;
    }
    
    registerUser(login, fullname); // async call
    setShowRegisterDialog(false);   // Close dialog
  };

    const handleCancelClick = () => {
      setShowRegisterDialog(false);    
  };

  return (
    <div className="dialog-backdrop">
      <div className="dialog" >
        <h3>New user Registration</h3>

        <label>User login</label>
        <br />
        <input 
          style={{marginBottom: "18px"}}
          id="inputLogin"
          placeholder="login"
          ref={loginRef}          
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleConfirmClick();
            }
          }}
        ></input>

        <br />
        <label>User Full name</label>
        <br />
        <input 
          placeholder="Full Name"
          ref={fullnameRef}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleConfirmClick();
            }
          }}
        ></input>

        <div className="dialog-buttons">
          {(
            <section>
              <button onClick={handleConfirmClick} >
                Confirm
              </button>
              <button onClick={handleCancelClick} >
                Cancel                
              </button>
          </section>)}
        </div>
      </div>
    </div>
  );
}

export default RegisterDialog;
