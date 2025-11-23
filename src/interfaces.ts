export interface User {
  userId: string;
  login: string;
  fullname: string;
  isonline: boolean;
};
  
export interface Message {
  msgId: number;
  chatId: number;
  userId: number;
  datetime: Date;
  text: string;
};
  
export interface ChatDisplay {
  chatId: number;
  userNames: string;
};

export interface ChatUsers {
  chatId: number;
  userIds: number[];
};