import { createClient } from "@/lib/supabase/server";
import SettingsForm from "@/components/admin/SettingsForm";

export default async function AdminSettingsPage() {
    const supabase = await createClient();

    const { data: settings } = await supabase
        .from("site_settings")
        .select("*");

    // Convert array of settings to an object for easier handling
    const settingsObject = settings?.reduce((acc: any, setting: any) => {
        acc[setting.key] = setting.value;
        return acc;
    }, {}) || {};

    return (
        <div style={{ maxWidth: "800px" }}>
            <div style={{ marginBottom: "24px" }}>
                <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#fff" }}>Site Settings</h1>
                <p style={{ color: "var(--color-text-dim)", fontSize: "14px" }}>
                    Manage global website configuration and contact information.
                </p>
            </div>

            <SettingsForm initialSettings={settingsObject} />
        </div>
    );
}
