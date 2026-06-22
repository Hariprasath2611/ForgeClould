import { Role } from '../entities/Role';

export interface IRoleRepository {
  findById(id: string): Promise<Role | null>;
  findAll(): Promise<Role[]>;
  save(role: Role): Promise<void>;
  update(role: Role): Promise<void>;
  delete(id: string): Promise<void>;
}
