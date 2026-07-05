export type TagType = 'hot' | 'new' | 'vip' | 'free';

export type StatusType = 'done' | 'doing' | 'todo';

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  tags?: TagType[];
  route: string;
  status: StatusType;
  isNew?: boolean;
  isHot?: boolean;
  toolIntroUsage?: string;
  logoUrl?: string;
  logoLocalPath?: string;
  detailPageUrl?: string;
}
