interface ConversationUser {
  id: string;
  username: string;
  avatar: string | null;
}

interface ConversationForFormat {
  id: string;
  participant1Id: string;
  participant2Id: string;
  updatedAt: Date;
  participant1: ConversationUser;
  participant2: ConversationUser;
}

export function formatConversationForUser({
  conversation,
  currentUserId,
}: {
  conversation: ConversationForFormat;
  currentUserId: string;
}) {
  const isP1 = conversation.participant1Id === currentUserId;
  const otherUser = isP1 ? conversation.participant2 : conversation.participant1;

  return {
    id: conversation.id,
    otherUser: {
      id: otherUser.id,
      username: otherUser.username,
      avatar: otherUser.avatar,
    },
    updatedAt: conversation.updatedAt.toISOString(),
  };
}
