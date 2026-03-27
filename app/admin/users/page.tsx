import { createClient } from "@/lib/supabase/server";
import UserRow from "@/components/admin/UserRow";
import UserManagementTabs from "@/components/admin/UserManagementTabs";

export default async function AdminUsersPage() {
    const supabase = await createClient();

    const { data: users } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#fff" }}>Manage Users</h1>
            </div>

            <UserManagementTabs />

            <div className="card">
                <table className="phw-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Joined Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users && users.length > 0 ? (
                            users.map((user: any) => (
                                <UserRow key={user.id} user={user} />
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "var(--color-text-dim)" }}>
                                    No users found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
