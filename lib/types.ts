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
  commentCount: number;
  createdAt: string;
}
