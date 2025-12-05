// ChatList.tsx
import type { User, ChatUsers, Message } from '../interfaces.ts'
import type { Dispatch, SetStateAction } from "react";
import { createChatList  } from '../services/utils.ts';


function ChatList(  { 
    usersRegistered, chatusers, currentChatId, setCurrentChatId, isWsConnected, messages  }: { 
    usersRegistered: User[];
    chatusers: ChatUsers[];    
    currentChatId: string | null;
    setCurrentChatId: Dispatch<SetStateAction<string | null>>;
    isWsConnected: boolean;
    messages: Message[];
  }
) {

/*export interface Message {
    msgId: string;
    chatId: string;
    userId: string;
    datetime: Date;
    text: string;
  };
  export interface ChatUsers {
    chatId: string;
    userIds: string[];
    name: string;
  }; 
  messages
  */

  const getLastMessage = ( chatId: string ) => {
    const chatMsgs = messages.filter(m=>m.chatId ==chatId );
    if( !chatMsgs.length ) return null;
    if( chatMsgs.length == 1 ) return chatMsgs[0];
    let msgLast = chatMsgs[0];
    for( let i = 1; i < chatMsgs.length; i++ )
      if( chatMsgs[i].datetime > chatMsgs[i-1].datetime )
        msgLast = chatMsgs[i];
    return msgLast;
  }

  const sortChats = () => {
    return [...chatusers].sort((a,b) => {
      const lastA = getLastMessage(a.chatId);
      const lastB = getLastMessage(b.chatId);
      const timeA = lastA ? lastA.datetime.getTime() : 0; 
      const timeB = lastB ? lastB.datetime.getTime() : 0; 
      return timeB - timeA;
    });
  }

  return (
    <section className="chat-list">
      <h2>Chats</h2>
      
      {(<ul>
        {sortChats().map(chat => (
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
