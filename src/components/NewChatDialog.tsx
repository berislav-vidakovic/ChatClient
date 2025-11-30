import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { User  } from "../interfaces";
import { createNewChat  } from '../services/utils.ts';


function NewChatDialog({ setShowNewChatDialog, usersRegistered, currentUserId
}: {
    setShowNewChatDialog: Dispatch<SetStateAction<boolean>>; 
    usersRegistered: User[];
    currentUserId: string;

}
  ) {
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const handleToggle = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((u) => u !== userId) : [...prev, userId]
    );
  };

  const handleConfirmClick = () => {    
    createNewChat(currentUserId, selectedUserIds);
    setShowNewChatDialog(false);
  };

  const handleCancelClick = () => {
    setShowNewChatDialog(false);
  };

  return (
    <div className="dialog-backdrop">
      <div className="dialog">
        <h3>Select new chat participants</h3>

        {/* User list with checkboxes */}
        <div className="user-checkbox-list">
          {usersRegistered
            .filter(u=>u.userId != currentUserId )
            .map((user) => (
            <label key={user.userId} className="user-checkbox-item">
              <input
                type="checkbox"
                checked={selectedUserIds.includes(user.userId)}
                onChange={() => handleToggle(user.userId)}
              />
              <span>{user.fullname}</span>
            </label>
          ))}
        </div>

        <div className="dialog-buttons">
          <button onClick={handleConfirmClick}>Confirm</button>
          <button onClick={handleCancelClick}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default NewChatDialog;
