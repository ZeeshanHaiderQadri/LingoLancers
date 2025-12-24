export type ChatMessage = {
  id: string;
  role: "user" | "agent" | "system";
  content: React.ReactNode;
};
