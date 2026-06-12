import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface PostContentProps {
  content: string;
}

export default function PostContent({ content }: PostContentProps) {
  return (
    <div className="prose prose-orange max-w-none prose-headings:text-ink prose-p:text-muted prose-a:text-accent prose-code:text-pink-600 prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-img:rounded-lg">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
