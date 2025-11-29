export interface User {
  userId: string;
  login: string;
  fullname: string;
  isonline: boolean;
};
  
export interface Message {
  msgId: string;
  chatId: string;
  userId: string;
  datetime: Date;
  text: string;
};
  
export interface ChatDisplay {
  chatId: string;
  userNames: string;
};

export interface ChatUsers {
  chatId: string;
  userIds: string[];
  name: string;
};