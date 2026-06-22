export class Organization {
  constructor(
    public readonly id: string,
    public name: string,
    public slug: string,
    public readonly ownerId: string,
    public readonly createdAt: Date
  ) {}
}
