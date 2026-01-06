export type Post = {
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
