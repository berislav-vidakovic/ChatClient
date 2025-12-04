// ChatList.tsx
import type { User, ChatUsers, ChatDisplay } from '../interfaces.ts'
import type { Dispatch, SetStateAction } from "react";
import { createChatList  } from '../services/utils.ts';


function ChatList(  { 
    usersRegistered, chatusers, currentChatId, setCurrentChatId, isWsConnected  }: { 
    usersRegistered: User[];
    chatusers: ChatUsers[];    
    currentChatId: string | null;
    setCurrentChatId: Dispatch<SetStateAction<string | null>>;
    isWsConnected: boolean;
  }
) {
  return (
    <section className="chat-list">
      <h2>Chats</h2>
      
      {(<ul>
        {chatusers.map(chat => (
          <li 
            key={chat.chatId}
            className= {chat.chatId == currentChatId ? 'active-chat' : ''}
            onClick={() => {
              setCurrentChatId(chat.chatId); //This triggers a re-render 
              // of all components that receive currentChatId.
              sessionStorage.setItem("chatId", String(chat.chatId));
            }}
            style={{ cursor: chat.chatId != currentChatId ? "pointer" : "default" }}
          >
            {chat.name}
          </li>
        ))}
      </ul>
      )}

      <hr />
      <h3>Users:</h3>
      { !usersRegistered.length || !isWsConnected ? '(No users loaded)'
        : <ul>        
          { (
            usersRegistered 
              .sort((a, b) => a.fullname.localeCompare(b.fullname) )
              .map((u) => ( 
                <li key={u.userId} className="user-item">               
                  {u.fullname} <br />
                  ({u.roles.join(',')}) <br />                  
                  <span
                    className={`status-dot ${
                      u.isonline ? "status-online" : "status-offline"
                    }`}
                  ></span>
                </li>
              ))
          )}        
        </ul>
      }

      

    </section>
  );
}

export default ChatList;
