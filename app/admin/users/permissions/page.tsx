import { createClient } from "@/lib/supabase/server";
import UserManagementTabs from "@/components/admin/UserManagementTabs";
import PermissionForm from "@/components/admin/PermissionForm";
import DeleteButton from "@/components/admin/DeleteButton";
import { Plus } from "lucide-react";

export default async function PermissionsPage() {
    const supabase = await createClient();

    const { data: permissions } = await supabase
        .from("permissions")
        .select("*")
        .order("name", { ascending: true });

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#fff" }}>Manage Permissions</h1>
            </div>

            <UserManagementTabs />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "24px", alignItems: "start" }}>
                <div className="card">
                    <table className="phw-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Description</th>
                                <th style={{ textAlign: "right" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {permissions && permissions.length > 0 ? (
                                permissions.map((permission: any) => (
                                    <tr key={permission.id}>
                                        <td style={{ fontWeight: 600, color: "var(--color-primary)" }}>{permission.name}</td>
                                        <td style={{ fontSize: "13px", color: "var(--color-text-dim)" }}>
                                            {permission.description || "—"}
                                        </td>
                                        <td style={{ textAlign: "right" }}>
                                            <DeleteButton 
                                                id={permission.id} 
                                                table="permissions" 
                                            />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} style={{ padding: "40px", textAlign: "center", color: "var(--color-text-dim)" }}>
                                        No permissions defined yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <PermissionForm />
            </div>
        </div>
    );
}
