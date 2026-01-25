import { Timestamp } from "firebase/firestore";

export function mapCommunityPost(doc: any) {
  const data = doc.data();
  const createdAt = data.createdAt as Timestamp | undefined;

  return {
    id: doc.id,
    username: data.name || data.username || data.displayName || "Anonymous",

    avatar:
      data.avatar ||
      data.userImage ||
      data.photoURL ||
      "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png",

    isExpert: !!data.isExpert, 

    content: data.content ?? "",
    likes: data.likes ?? 0,

    time: createdAt
      ? formatTime(createdAt.toDate())
      : "Just now",

    product: data.product
      ? {
          brand: data.product.brand ?? "Unknown Brand",
          name: data.product.name ?? "Unknown Product",
          safety: data.product.safety ?? "UNKNOWN",
        }
      : undefined,
  };
}

function formatTime(date: Date) {
  const diff = Math.floor((Date.now() - date.getTime()) / 60000);

  if (diff < 1) return "Just now";
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;

  return `${Math.floor(diff / 1440)}d ago`;
}