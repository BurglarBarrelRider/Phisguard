import { SessionUser } from './user.model';

export interface Comment {
  id: string;
  reportId: string;
  user: SessionUser;
  content: string;
  timestamp: Date;
}
