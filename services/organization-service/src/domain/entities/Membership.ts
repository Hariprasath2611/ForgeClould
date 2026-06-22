export class Membership {
  constructor(
    public readonly id: string,
    public readonly organizationId: string,
    public readonly userId: string,
    public roleId: string,
    public status: string
  ) {}
}
