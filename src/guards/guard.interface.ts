export interface JwtPayload {
  readonly userId: string;
  readonly userType: string;
  readonly exportPermission: string;
}
