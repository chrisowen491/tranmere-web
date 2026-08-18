import { ImageResponse } from "next/og";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getSharedFantasyTeam, hydrateFantasyTeam } from "@/lib/fantasyTeams";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const db = (await getCloudflareContext({ async: true })).env.DB;
  const team = await getSharedFantasyTeam(db, (await params).id);
  if (!team) return new Response("Not found", { status: 404 });
  const players = await hydrateFantasyTeam(db, team);
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#071a2b",
        color: "white",
        padding: 64,
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          color: "#7dd3fc",
          fontSize: 20,
          letterSpacing: 5,
          textTransform: "uppercase",
        }}
      >
        Tranmere Rovers Archive · Fantasy XI
      </div>
      <div style={{ fontSize: 62, fontWeight: 800, marginTop: 18 }}>
        {team.name}
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 35,
          background: "#0754a6",
          padding: 32,
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        {players.map((player) => (
          <div
            key={player.slotId}
            style={{
              display: "flex",
              width: "30%",
              padding: 14,
              background: "#fffdf8",
              color: "#071a2b",
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            {player.playerName}
            {player.playerId === team.captainPlayerId ? " (C)" : ""}
          </div>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "auto",
          fontSize: 22,
        }}
      >
        <span>
          {team.formation === "442" ? "4–4–2" : "4–3–3"} · {team.kit} kit
        </span>
        <span>tranmere-web.com</span>
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
