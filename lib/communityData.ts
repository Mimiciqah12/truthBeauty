export type CommunityPost = {
  id: string;
  name: string;
  avatar: string;
  isExpert?: boolean;
  content: string;
  time: string;
  product?: {
    brand: string;
    name: string;
    safety: "SAFE" | "CAUTION" | "AVOID";
  };
};

export const COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: "1",
    name: "Dr. Sarah Chen",
    avatar:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=200&q=60",
    isExpert: true,
    time: "2h ago",
    content:
      "The hydration performance is good, but the fragrance level may irritate sensitive skin types.",
    product: {
      brand: "LUMINA",
      name: "Hydra Boost Serum",
      safety: "CAUTION",
    },
  },
  {
    id: "2",
    name: "Alex Rivera",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=60",
    time: "5h ago",
    content:
      "This sunscreen doesn’t leave white cast and feels lightweight on oily skin.",
    product: {
      brand: "SUNSAFE",
      name: "Invisible Shield SPF50",
      safety: "SAFE",
    },
  },
];
