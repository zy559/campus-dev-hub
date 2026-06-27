interface LocalPreviewAuthInput {
  nodeEnv?: string;
  username: string;
  password: string;
}

export function getLocalPreviewUser(input: LocalPreviewAuthInput) {
  if (input.nodeEnv === "production") return null;
  if (input.username !== "admin" || input.password !== "admin123") return null;

  return {
    id: "local-preview-admin",
    email: "admin@local.preview",
    name: "admin",
    role: "admin",
  };
}
