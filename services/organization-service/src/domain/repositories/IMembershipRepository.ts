import { Membership } from '../entities/Membership';

export interface IMembershipRepository {
  findById(id: string): Promise<Membership | null>;
  findByOrganizationId(organizationId: string): Promise<Membership[]>;
  findByUserId(userId: string): Promise<Membership[]>;
  save(membership: Membership): Promise<void>;
  update(membership: Membership): Promise<void>;
  delete(id: string): Promise<void>;
}
