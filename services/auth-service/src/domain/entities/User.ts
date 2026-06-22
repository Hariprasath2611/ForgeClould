export class User {
  constructor(
    public readonly id: string,
    public readonly firebaseUid: string,
    public email: string,
    public name: string,
    public status: string,
    public readonly createdAt: Date
  ) {}
}
