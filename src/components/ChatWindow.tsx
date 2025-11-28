//ChatWindow.tsx
import React, { useState, useRef, useEffect } from 'react';
import type { User, Message, ChatUsers, ChatDisplay } from '../interfaces.ts'
import { createChatList, sendChatMessage  } from '../services/utils.ts';


function ChatWindow( { 
      usersRegistered, currentUserId, currentChatId, messages, chatusers }: { 
      usersRegistered: User[];
      currentUserId: string | null;
      currentChatId: number | null;
      messages: Message[];    
      chatusers: ChatUsers[];    
    }
) { 
  const [messageText, setMessageText] = useState(""); // track textarea input

  const chats : ChatDisplay[] = createChatList(usersRegistered, chatusers);
  const chatMessages = messages
    .filter(m => m.chatId==currentChatId)
    .sort((a, b) => a.datetime.getTime()-b.datetime.getTime());
  
  const handleSend = () => {
    if (!messageText.trim() || currentUserId == null || currentChatId == null) return;
    sendChatMessage(currentUserId, currentChatId, messageText.trim()); //  send text
    setMessageText(""); //  clear textarea after sending
  };

  // ✅ handle Enter press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // prevent newline
      handleSend();
    }
  };
  
  const isSameDay = (dt1: Date, dt2: Date):boolean => {
    return dt1.getDate() === dt2.getDate() &&
      dt1.getMonth() === dt2.getMonth() &&
      dt1.getFullYear() === dt2.getFullYear();
  }

  const isRecent = (dt: Date):string => {
    const now = new Date();
    const isToday = isSameDay(dt,now);
    if (isToday) return "Today";

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = isSameDay(yesterday,dt);
    if (isYesterday) return "Yesterday";

    return "";
  }
  const formatDate = (dt: Date):string => {
    const lastWeekLabel = isRecent(dt);
    if( lastWeekLabel ) return lastWeekLabel;

    return dt.toLocaleString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }).replace(",", "");
  };

  const formatTime = (dt: Date):string => {
    return dt.toLocaleString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).replace(",", "");
  };

  const messagesContainerRef  = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
  const container = messagesContainerRef.current;
  if (container) {
    container.scrollTop = container.scrollHeight; // 👈 jump to bottom instantly
    // Or smooth:
    // container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }
  }, [chatMessages.length]);

  return (
    <section className="chat-window">
      <h2>
        {chats.find(c=>c.chatId == currentChatId)?.userNames}
      </h2>

{/*export interface Message {
  msgId: number;
  chatId: number;
  userId: number;
  datetime: Date;
  text: string;
};*/}
      <div className="messages" ref={messagesContainerRef}>
        {chatMessages.map((m, i)=>{ 
          const prev = chatMessages[i - 1];
          const showDate = !prev ||
            m.datetime.toDateString() !== prev.datetime.toDateString();
          return (
            <React.Fragment key={m.msgId}>
            {showDate && (
              <div className="message-date">{formatDate(m.datetime)}</div>
            )}
            {
            m.userId == currentUserId 
              ? (
                <div className={`message-bubble you`}>
                  <div className="message-text">{m.text}
                  </div>
                  <div className="message-meta">
                    <span>{'You'}</span>
                    <span>{formatTime(m.datetime)}</span>
                </div>
                </div>
              )
            : (
              <div className={`message-bubble them`}>
                <div className="message-text">{m.text}</div>
                <div className="message-meta">
                  <span>{usersRegistered.find(u=>u.userId==m.userId)!.fullname}</span>
                  <span>{formatTime(m.datetime)}</span>
                </div>
              </div>
            )}
            </React.Fragment>
          );
        })}

      </div>

      <div className="message-input">
        <textarea 
          placeholder="Type a message..."
          rows={1}          
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)} // 👈 update state
          onKeyDown={handleKeyDown} // ✅ send on Enter 
        ></textarea>
        <button onClick={handleSend}>Send</button>
      </div>
    </section>
  );
}

export default ChatWindow;
