// UsersDialog.tsx
import type { Dispatch, SetStateAction } from "react";
import type { User, Role } from '../interfaces.ts';
import { useEffect, useRef, useState } from "react";
import { loginUser, requestUserRoleUpdate } from "../services/utils.ts";



function UsersDialog({ 
    setShowUsersRoles, usersRegistered, setUsersRegistered, isWsConnected, availableRoles
  }: { 
    setShowUsersRoles: Dispatch<SetStateAction<boolean>>;
    usersRegistered: User[];
    setUsersRegistered: Dispatch<SetStateAction<User[]>>;
    isWsConnected: boolean;
    availableRoles: Role[]
 }
) {

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const selectedUserRef = useRef<HTMLSelectElement>(null);

  const [userRoles, setUserRoles] = useState<string[]>([]);

  const selectedUser = usersRegistered.find(
    u => u.userId === selectedUserId
  );

  useEffect(()=>{
    const user1 = usersRegistered.find(u => !u.isonline)?.userId;
    if( user1 )
      setSelectedUserId(user1);
  }, []);

  // Sync userRoles when selectedUserId changes
  useEffect(() => {
  if (selectedUser) {
    setUserRoles(selectedUser.roles);
    }
  }, [selectedUser]);
  
  const handleConfirmClick = () => {
     if (!isWsConnected) {
      alert("You are disconnected.");
      setShowUsersRoles(false);    
      return;
    }  
    const selectedUserId : string = selectedUserRef.current!.value;

    console.log("Selected user ID:", selectedUserId);
    //console.log("Selected user:", selectedUser);
    console.log("selectedUser.roles:", ...userRoles);
    //console.log("availableRoles:", availableRoles);
    requestUserRoleUpdate( selectedUserId, userRoles );
    
    // Update usersRegistered with the selected roles
    setUsersRegistered(prevUsers => 
      prevUsers.map(user =>
        user.userId === selectedUserId
          ? { ...user, roles: userRoles } // <-- update roles
          : user
      )
    );

    setShowUsersRoles(false);    // Close dialog
  };

  const handleCancelClick = () => {
    setShowUsersRoles(false);
  };

 

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
                    checked={userRoles.includes(role.role)}
                    onChange={() => {
                      if (userRoles.includes(role.role)) {
                        // Remove role
                        setUserRoles(userRoles.filter(r => r !== role.role));
                      } else {
                        // Add role
                        setUserRoles([...userRoles, role.role]);
                      }
                    }}
                  />
                  <span>{role.role}</span>
                </label>
              ))}
            </div>
            }

           <label>Claims: </label>
          <div className="claims-list">
            {(() => {
              const roles = availableRoles.filter(r => userRoles.includes(r.role));
              const claims = new Set<string>();
              for (let role of roles) {
                for (let claim of role.claims) {
                  claims.add(claim);
                }
              }
              return Array.from(claims).join(', ');
            })()}
          </div>
            

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
