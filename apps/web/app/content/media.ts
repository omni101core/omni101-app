export const media: {
  reel: {src: string; alt: string; w: number; h: number}[];
  work: {src: string; alt: string; w: number; h: number}[];
  explore: {src: string; alt: string; w: number; h: number}[];
  solutions: {
    build?: {src: string; alt: string; w: number; h: number};
    automate?: {src: string; alt: string; w: number; h: number};
    create?: {src: string; alt: string; w: number; h: number};
    grow?: {src: string; alt: string; w: number; h: number};
  };
  cinema: {src: string; alt: string; w: number; h: number}[];
  insights: {src: string; alt: string; w: number; h: number}[];
  studio: {src?: string; alt?: string; w?: number; h?: number};
  menu: {src?: string; alt?: string; w?: number; h?: number};
} = {
  reel: [],
  work: [],
  explore: [],
  solutions: {},
  cinema: [],
  insights: [],
  studio: {},
  menu: {},
};
