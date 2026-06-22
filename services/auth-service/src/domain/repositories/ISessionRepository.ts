import { Session } from '../entities/Session';

export interface ISessionRepository {
  findById(id: string): Promise<Session | null>;
  findByUserId(userId: string): Promise<Session[]>;
  save(session: Session): Promise<void>;
  update(session: Session): Promise<void>;
  delete(id: string): Promise<void>;
}
