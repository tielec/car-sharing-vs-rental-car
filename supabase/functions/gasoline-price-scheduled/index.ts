import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Check if auto-fetch is enabled
    const { data: setting } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "auto_fetch_gasoline_price")
      .single();

    if (!setting || setting.value !== "true") {
      return new Response(
        JSON.stringify({ message: "Auto-fetch is disabled, skipping." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Fetch gasoline price from API
    const res = await fetch("https://ichioak.com/stat/gasoline_prices.json");
    if (!res.ok) throw new Error("Failed to fetch gasoline prices from API");
    const data = await res.json();

    const avg = Math.round(Number(data.average_price));
    if (!avg || avg <= 0) throw new Error("Invalid price from API");

    const fetchDate = data.fetch_date || new Date().toISOString().slice(0, 10);

    // Deactivate existing active overrides
    await supabase
      .from("gasoline_price_overrides")
      .update({ is_active: false })
      .eq("is_active", true);

    // Insert new override with a system note
    const { error: insertError } = await supabase
      .from("gasoline_price_overrides")
      .insert({
        price: avg,
        note: `定期自動取得（${fetchDate}）`,
        set_by: null,
        is_active: true,
      });

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({ message: `Auto-fetched price: ${avg} yen/L`, price: avg }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Scheduled gasoline price fetch error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
