export class Session {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public deviceName: string,
    public ipAddress: string,
    public lastActivity: Date,
    public status: string
  ) {}
}
