import { createClient } from "./lib/supabase/server";

async function test() {
    try {
        const supabase = await createClient();
        console.log("Testing connection...");
        const { data: horse, error } = await supabase
            .from("horses")
            .select("id, name")
            .eq("id", 5)
            .single();
        
        if (error) {
            console.error("Error fetching horse 5:", error.message);
        } else {
            console.log("Horse 5 found:", horse);
        }

        const { data: allHorses } = await supabase.from("horses").select("id, name");
        console.log("All horses:", allHorses);
    } catch (e: any) {
        console.error("Crash:", e.message);
    }
}

test();
