import type {
  DemoCapability,
  DemoMembershipView,
  DemoRole,
  DemoSessionView,
  DemoTenantId,
  DemoTenantView,
} from "@/features/demo-data/contracts";

const API_BASE_URL = process.env.NEXT_PUBLIC_COMMERCE_AI_API_BASE_URL ?? "http://localhost:8000";

interface ApiActorView {
  readonly id: string;
  readonly name: string;
  readonly email: string;
}

interface ApiTenantView {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
}

interface ApiMembershipView {
  readonly tenant: ApiTenantView;
  readonly role: DemoRole;
  readonly allowedCapabilities: readonly DemoCapability[];
}

interface ApiSessionView {
  readonly actor: ApiActorView;
  readonly activeTenant: ApiTenantView;
  readonly memberships: readonly ApiMembershipView[];
  readonly role: DemoRole;
  readonly allowedCapabilities: readonly DemoCapability[];
}

export class AuthApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "AuthApiError";
  }
}

function toDemoTenantId(apiTenantId: string): DemoTenantId {
  if (apiTenantId === "tenant_northstar") {
    return "tenant_northstar_retail";
  }
  if (apiTenantId === "tenant_acme") {
    return "tenant_acme_outlet";
  }
  throw new AuthApiError("Unknown tenant returned by auth API.", 502);
}

function toApiTenantId(demoTenantId: DemoTenantId): string {
  if (demoTenantId === "tenant_northstar_retail") {
    return "tenant_northstar";
  }
  if (demoTenantId === "tenant_acme_outlet") {
    return "tenant_acme";
  }
  throw new AuthApiError("Unknown tenant requested for auth API.", 400);
}

function toDemoTenantView(tenant: ApiTenantView): DemoTenantView {
  return {
    id: toDemoTenantId(tenant.id),
    name: tenant.name,
    slug: tenant.slug,
  };
}

function toDemoMembershipView(membership: ApiMembershipView): DemoMembershipView {
  return {
    tenant: toDemoTenantView(membership.tenant),
    role: membership.role,
    allowedCapabilities: membership.allowedCapabilities,
  };
}

function toDemoSessionView(session: ApiSessionView): DemoSessionView {
  return {
    actor: session.actor,
    activeTenant: toDemoTenantView(session.activeTenant),
    memberships: session.memberships.map(toDemoMembershipView),
    role: session.role,
    allowedCapabilities: session.allowedCapabilities,
  };
}

async function requestSession(path: string, init: RequestInit = {}): Promise<DemoSessionView> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  if (!response.ok) {
    throw new AuthApiError("Auth API request failed.", response.status);
  }

  return toDemoSessionView((await response.json()) as ApiSessionView);
}

export function login(email: string, password: string): Promise<DemoSessionView> {
  return requestSession("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function logout(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok && response.status !== 204) {
    throw new AuthApiError("Auth API logout failed.", response.status);
  }
}

export function getSession(): Promise<DemoSessionView> {
  return requestSession("/auth/session");
}

export function switchActiveTenant(tenantId: DemoTenantId): Promise<DemoSessionView> {
  return requestSession("/auth/active-tenant", {
    method: "PUT",
    body: JSON.stringify({ tenant_id: toApiTenantId(tenantId) }),
  });
}
