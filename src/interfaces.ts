export interface User {
  userId: string;
  login: string;
  fullname: string;
  isonline: boolean;
  roles: string[];
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

export interface Role {
  role: string;
  claims: string[];
}