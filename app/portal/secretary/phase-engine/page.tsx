import { createClient } from "@/lib/supabase/server";
import { PhaseEnginePanel } from "@/components/secretary/phase-engine-panel";

export default async function PhaseEnginePage() {
  const supabase = await createClient();

  const { data: phases } = await supabase
    .from("phase_settings")
    .select("phase_number, phase_name, is_open, opens_at, closes_at, updated_at")
    .order("phase_number", { ascending: true });

  return <PhaseEnginePanel initialPhases={phases ?? []} />;
}
