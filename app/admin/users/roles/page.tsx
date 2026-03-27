import { createClient } from "@/lib/supabase/server";
import UserManagementTabs from "@/components/admin/UserManagementTabs";
import RoleForm from "@/components/admin/RoleForm";
import DeleteButton from "@/components/admin/DeleteButton";
import { Shield, Key } from "lucide-react";

export default async function RolesPage() {
    const supabase = await createClient();

    // Fetch all roles
    const { data: roles } = await supabase
        .from("roles")
        .select("*")
        .order("name", { ascending: true });

    // Fetch all permissions for the form
    const { data: allPermissions } = await supabase
        .from("permissions")
        .select("id, name")
        .order("name", { ascending: true });

    // Fetch role-permission relations
    const { data: rolePermissions } = await supabase
        .from("role_permissions")
        .select(`
            role_id,
            permission_id,
            permissions (
                name
            )
        `);

    // Group permissions by role_id
    const permissionsByRole: Record<number, string[]> = {};
    rolePermissions?.forEach((rp: any) => {
        if (!permissionsByRole[rp.role_id]) {
            permissionsByRole[rp.role_id] = [];
        }
        if (rp.permissions && rp.permissions.name) {
            permissionsByRole[rp.role_id].push(rp.permissions.name);
        }
    });

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#fff" }}>Manage Roles</h1>
            </div>

            <UserManagementTabs />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "24px", alignItems: "start" }}>
                <div className="card">
                    <table className="phw-table">
                        <thead>
                            <tr>
                                <th>Role Name</th>
                                <th>Permissions</th>
                                <th style={{ textAlign: "right" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {roles && roles.length > 0 ? (
                                roles.map((role: any) => (
                                    <tr key={role.id}>
                                        <td style={{ verticalAlign: "top" }}>
                                            <div style={{ fontWeight: 600, color: "#fff" }}>{role.name}</div>
                                            <div style={{ fontSize: "11px", color: "var(--color-text-dim)", marginTop: "4px" }}>
                                                {role.description || "No description"}
                                            </div>
                                        </td>
                                        <td style={{ verticalAlign: "top" }}>
                                            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                                                {permissionsByRole[role.id] && permissionsByRole[role.id].length > 0 ? (
                                                    permissionsByRole[role.id].map((pName) => (
                                                        <span 
                                                            key={pName} 
                                                            style={{ 
                                                                fontSize: "10px", 
                                                                padding: "2px 6px", 
                                                                background: "rgba(255,255,255,0.05)", 
                                                                color: "var(--color-text-dim)", 
                                                                borderRadius: "4px",
                                                                border: "1px solid var(--color-border)"
                                                            }}
                                                        >
                                                            {pName}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span style={{ fontSize: "11px", color: "var(--color-text-dim)" }}>
                                                        No permissions assigned
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ textAlign: "right", verticalAlign: "top" }}>
                                            <DeleteButton 
                                                id={role.id} 
                                                table="roles" 
                                            />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} style={{ padding: "40px", textAlign: "center", color: "var(--color-text-dim)" }}>
                                        No custom roles defined yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <RoleForm allPermissions={allPermissions || []} />
            </div>
        </div>
    );
}
