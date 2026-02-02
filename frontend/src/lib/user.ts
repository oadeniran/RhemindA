export const getUserId = (): string => {
  if (typeof window === "undefined") return "server-side-placeholder";
  
  let id = localStorage.getItem("reminda_user_id");
  if (!id) {
    id = "user_" + Math.random().toString(36).substring(2, 9);
    localStorage.setItem("reminda_user_id", id);
  }
  return id;
};