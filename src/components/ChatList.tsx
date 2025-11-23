// ChatList.tsx
import type { User, ChatUsers, ChatDisplay } from '../interfaces.ts'
import type { Dispatch, SetStateAction } from "react";
import { createChatList  } from '../services/utils.ts';


function ChatList(  { 
    usersRegistered, chatusers, currentChatId, setCurrentChatId, isWsConnected  }: { 
    usersRegistered: User[];
    chatusers: ChatUsers[];    
    currentChatId: number | null;
    setCurrentChatId: Dispatch<SetStateAction<number | null>>;
    isWsConnected: boolean;
  }
) {
  const chats : ChatDisplay[] = createChatList(usersRegistered, chatusers,true);
  return (
    <section className="chat-list">
      <h2>Chats</h2>
      
      {(<ul>
        {chats.map(chat => (
          <li 
            key={chat.chatId}
            className= {chat.chatId == currentChatId ? 'active-chat' : ''}
            onClick={() => { 
              setCurrentChatId(chat.chatId);
              sessionStorage.setItem("chatId", String(chat.chatId));
            }}
            style={{ cursor: chat.chatId != currentChatId ? "pointer" : "default" }}
          >
            Ch.{chat.chatId}: {chat.userNames}
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
                  {u.fullname} 
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
