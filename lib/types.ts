// 标签相关公共类型
export interface Tag {
  id: string;
  name: string;
}

export interface PostTag {
  tag: Tag;
}

// 帖子相关类型
export interface PostCardData {
  id: string;
  title: string;
  content: string;
  author: { id: string; username: string; avatar: string | null };
  tags: Tag[];
  board?: { id: string; name: string };
  commentCount: number;
  createdAt: string;
}

// 板块
export interface Board {
  id: string;
  name: string;
  description: string;
  sortOrder: number;
  parentId: string | null;
  children?: Board[];
}

// 对话
export interface ConversationData {
  id: string;
  otherUser: {
    id: string;
    username: string;
    avatar: string | null;
  };
  lastMessage?: {
    content: string;
    createdAt: string;
  };
  updatedAt: string;
}

// 消息
export interface MessageData {
  id: string;
  conversationId: string;
  content: string;
  sender: {
    id: string;
    username: string;
    avatar: string | null;
  };
  createdAt: string;
}
