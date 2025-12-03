// UsersDialog.tsx
import type { Dispatch, SetStateAction } from "react";
import type { User, Role } from '../interfaces.ts';
import { useEffect, useRef, useState } from "react";
import { loginUser } from "../services/utils.ts";


function UsersDialog({ 
    setShowUsersRoles, usersRegistered, isWsConnected, availableRoles
  }: { 
    setShowUsersRoles: Dispatch<SetStateAction<boolean>>;
    usersRegistered: User[];
    isWsConnected: boolean;
    availableRoles: Role[]
 }
) {

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const selectedUserRef = useRef<HTMLSelectElement>(null);

  


  useEffect(()=>{
    const user1 = usersRegistered.find(u => !u.isonline)?.userId;
    if( user1 )
      setSelectedUserId(user1);
  }, []);
  
  const handleConfirmClick = () => {
     if (!isWsConnected) {
      alert("You are disconnected.");
      setShowUsersRoles(false);    
      return;
    }  
    const selectedUserId : string = selectedUserRef.current!.value;

    console.log("Selected user ID:", selectedUserId);
    console.log("Selected user:", selectedUser);
    console.log("selectedUser.roles:", selectedUser?.roles);
    console.log("availableRoles:", availableRoles);
    

    setShowUsersRoles(false);    // Close dialog
  };

  const handleCancelClick = () => {
    setShowUsersRoles(false);
  };

  const selectedUser = usersRegistered.find(
    u => u.userId === selectedUserId
  );

  console.log("usersRegistered:", usersRegistered);
  console.log("availableRoles:", availableRoles);
  console.log("selectedUserId:", selectedUserId);
  console.log("selectedUser:", selectedUser);

  return (
    <div className="dialog-backdrop">
      <div className="dialog">
        <h3> User</h3>
        {(
          <select 
            ref={selectedUserRef}
            value={selectedUserId ?? ""}
            onChange={(e) => setSelectedUserId(e.target.value)}
          >
            {usersRegistered
              .filter(u => !u.isonline )
              .map(u => (
                <option key={u.userId} value={u.userId}>
                  {u.fullname}
                </option>
              ))
            }
          </select>
        )}

      {selectedUser && (
        <>
        <h3> Roles</h3>        
        {
        <div className="user-checkbox-list">
          {availableRoles
            .map((role) => (
            <label key={role.role} className="user-checkbox-item">
              <input
                type="checkbox"
                checked={selectedUser.roles.some(r => r === role.role)}
                //onChange={() => handleToggle(user.userId)}
              />
              <span>{role.role}</span>

            </label>
          ))}
        </div>
        }
        </>)}


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

export default UsersDialog;
