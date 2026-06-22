export class Role {
  constructor(
    public readonly id: string,
    public name: string,
    public permissions: string[]
  ) {}
}
