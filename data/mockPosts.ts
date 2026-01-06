import { Post } from "@/types/Post";

export const MOCK_POSTS: Post[] = [
  {
    id: "1",
    name: "Dr. Sarah Chen",
    avatar:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=200&q=60",
    isExpert: true,
    content:
      "The hydration performance is good, but the fragrance level may irritate sensitive skin types.",
    time: "2h ago",
    product: {
      brand: "Lumina",
      name: "Hydra Boost Serum",
      safety: "CAUTION",
    },
  },
  {
    id: "2",
    name: "Alex Rivera",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=60",
    content:
      "This sunscreen doesn’t leave white cast and feels lightweight on oily skin.",
    time: "5h ago",
    product: {
      brand: "SunSafe",
      name: "Invisible Shield SPF50",
      safety: "SAFE",
    },
  },
];
