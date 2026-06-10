import Link from "next/link";

interface Tag {
  id: string;
  name: string;
}

interface PostCardProps {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    username: string;
    avatar: string | null;
  };
  tags: Tag[];
  commentCount: number;
  createdAt: string;
}

export default function PostCard({
  id,
  title,
  content,
  author,
  tags,
  commentCount,
  createdAt,
}: PostCardProps) {
  return (
    <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <Link href={`/profile/${author.username}`}>
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
            {author.username.charAt(0).toUpperCase()}
          </div>
        </Link>
        <Link
          href={`/profile/${author.username}`}
          className="text-sm font-medium text-gray-900 hover:text-indigo-600"
        >
          {author.username}
        </Link>
        <span className="text-sm text-gray-500">
          {new Date(createdAt).toLocaleDateString("zh-CN")}
        </span>
      </div>

      <Link href={`/posts/${id}`}>
        <h2 className="text-xl font-bold text-gray-900 mb-2 hover:text-indigo-600 transition-colors">
          {title}
        </h2>
      </Link>

      <p className="text-gray-600 mb-4 line-clamp-3">{content}</p>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/?tag=${tag.name}`}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
            >
              {tag.name}
            </Link>
          ))}
        </div>

        <span className="text-sm text-gray-500">
          {commentCount} 条评论
        </span>
      </div>
    </article>
  );
}
