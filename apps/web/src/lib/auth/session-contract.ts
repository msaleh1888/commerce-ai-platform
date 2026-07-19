export type CurrentTenantView = {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
};

export type CurrentSessionView = {
  readonly activeTenant: CurrentTenantView;
};
