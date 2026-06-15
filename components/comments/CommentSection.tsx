"use client";

import { useState, useCallback } from "react";
import CommentForm from "./CommentForm";
import CommentList from "./CommentList";

export default function CommentSection({ postId }: { postId: string }) {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCommentAdded = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  return (
    <>
      <CommentForm postId={postId} onCommentAdded={handleCommentAdded} />
      <div className="mt-8">
        <CommentList key={refreshKey} postId={postId} />
      </div>
    </>
  );
}
