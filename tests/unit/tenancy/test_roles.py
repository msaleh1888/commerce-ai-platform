from commerce_ai_api.modules.tenancy.domain.roles import Role, capabilities_for_role, role_allows


def test_role_model_contains_adr_0008_roles() -> None:
    assert {role.value for role in Role} == {
        "administrator",
        "catalog_manager",
        "merchandiser",
        "ai_engineer",
        "viewer",
    }


def test_administrator_can_manage_members_and_catalog() -> None:
    capabilities = capabilities_for_role(Role.ADMINISTRATOR)

    assert "tenant_members:manage" in capabilities
    assert "catalog_changes:approve" in capabilities


def test_lower_privilege_roles_cannot_approve_catalog_mutations() -> None:
    assert role_allows(Role.CATALOG_MANAGER, "catalog_changes:approve")
    assert not role_allows(Role.MERCHANDISER, "catalog_changes:approve")
    assert not role_allows(Role.AI_ENGINEER, "catalog_changes:approve")
    assert not role_allows(Role.VIEWER, "catalog_changes:approve")
