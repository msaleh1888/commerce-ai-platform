export type CurrentTenantView = {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
};

export type CurrentActorView = {
  readonly name: string;
};

export type CurrentSessionView = {
  readonly actor: CurrentActorView;
  readonly activeTenant: CurrentTenantView;
  readonly role: string;
  readonly allowedCapabilities: readonly string[];
};
