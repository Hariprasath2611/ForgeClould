import { Organization } from '../entities/Organization';

export interface IOrganizationRepository {
  findById(id: string): Promise<Organization | null>;
  findBySlug(slug: string): Promise<Organization | null>;
  save(organization: Organization): Promise<void>;
  update(organization: Organization): Promise<void>;
  delete(id: string): Promise<void>;
}
