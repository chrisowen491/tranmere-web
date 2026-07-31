export const MATCH_UI_URI = 'ui://tranmere-web/match-v3.html';

export const matchWidgetHtml = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      :root {
        color-scheme: light dark;
        --navy: #071d49;
        --blue: #075bb5;
        --green: #009b77;
        --ink: light-dark(#10213b, #f4f7fb);
        --muted: light-dark(#66758b, #acbad0);
        --surface: light-dark(#fffdf8, #13213a);
        --soft: light-dark(#edf3f8, #1d2c48);
        --line: light-dark(#d7e0e9, #31415f);
      }

      * { box-sizing: border-box; }

      body {
        margin: 0;
        color: var(--ink);
        background: transparent;
        font: 14px/1.45 ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      .card {
        overflow: hidden;
        border: 1px solid var(--line);
        border-radius: 22px;
        background: var(--surface);
        box-shadow: 0 18px 44px rgb(7 29 73 / 12%);
      }

      .scoreboard {
        position: relative;
        overflow: hidden;
        padding: 24px;
        color: white;
        background:
          radial-gradient(circle at 95% 5%, rgb(0 155 119 / 58%), transparent 35%),
          linear-gradient(125deg, var(--navy), var(--blue));
      }

      .scoreboard::after {
        position: absolute;
        inset: 0;
        content: "";
        opacity: .12;
        background: repeating-linear-gradient(115deg, transparent 0 20px, white 21px 22px);
        pointer-events: none;
      }

      .context, .teams, .result { position: relative; z-index: 1; }

      .context {
        margin: 0;
        color: #8ff2d4;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: .15em;
        text-align: center;
        text-transform: uppercase;
      }

      .teams {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
        align-items: center;
        gap: 14px;
        margin-top: 20px;
      }

      .team {
        margin: 0;
        font-size: clamp(17px, 4vw, 26px);
        font-weight: 850;
        line-height: 1.08;
        letter-spacing: -.035em;
      }

      .team:first-child { text-align: right; }

      .result {
        min-width: 86px;
        padding: 10px 13px;
        border: 1px solid rgb(255 255 255 / 32%);
        border-radius: 13px;
        background: rgb(0 0 0 / 20%);
        font-size: 29px;
        font-weight: 900;
        letter-spacing: -.04em;
        text-align: center;
      }

      .body { padding: 18px; }

      .facts {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        border: 1px solid var(--line);
        border-radius: 14px;
        background: var(--soft);
      }

      .fact { min-width: 0; padding: 13px 14px; }
      .fact:nth-child(even) { border-left: 1px solid var(--line); }
      .fact:nth-child(n+3) { border-top: 1px solid var(--line); }

      dt {
        color: var(--muted);
        font-size: 10px;
        font-weight: 800;
        letter-spacing: .12em;
        text-transform: uppercase;
      }

      dd {
        margin: 5px 0 0;
        overflow: hidden;
        font-weight: 750;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .section { margin-top: 18px; }

      h2 {
        margin: 0 0 9px;
        color: var(--blue);
        font-size: 11px;
        font-weight: 850;
        letter-spacing: .13em;
        text-transform: uppercase;
      }

      .scorers, .lineup {
        display: flex;
        flex-wrap: wrap;
        gap: 7px;
      }

      .pill {
        padding: 6px 9px;
        border: 1px solid var(--line);
        border-radius: 999px;
        background: var(--soft);
        font-size: 12px;
        font-weight: 700;
      }

      .minute { color: var(--green); }

      .report {
        display: -webkit-box;
        margin: 0;
        overflow: hidden;
        color: var(--muted);
        line-height: 1.6;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 4;
      }

      .footer {
        display: flex;
        justify-content: flex-end;
        margin-top: 18px;
        padding-top: 14px;
        border-top: 1px solid var(--line);
      }

      .link {
        color: var(--blue);
        font-size: 12px;
        font-weight: 800;
        text-decoration: none;
      }

      .link:hover { text-decoration: underline; }

      .empty { padding: 34px; color: var(--muted); text-align: center; }

      @media (max-width: 520px) {
        .scoreboard { padding: 20px 14px; }
        .teams { gap: 8px; }
        .result { min-width: 70px; font-size: 24px; }
        .body { padding: 14px; }
      }
    </style>
  </head>
  <body>
    <main class="card" id="root">
      <div class="empty">Loading match…</div>
    </main>

    <script>
      const root = document.getElementById("root");

      function text(value, fallback = "—") {
        return value === null || value === undefined || value === ""
          ? fallback
          : String(value);
      }

      function formatDate(value) {
        const date = new Date(String(value) + "T12:00:00Z");
        return Number.isNaN(date.valueOf())
          ? text(value)
          : new Intl.DateTimeFormat(document.documentElement.lang || "en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
              timeZone: "UTC"
            }).format(date);
      }

      function fact(label, value) {
        const item = document.createElement("div");
        item.className = "fact";
        const term = document.createElement("dt");
        term.textContent = label;
        const description = document.createElement("dd");
        description.textContent = text(value);
        item.append(term, description);
        return item;
      }

      function section(title) {
        const element = document.createElement("section");
        element.className = "section";
        const heading = document.createElement("h2");
        heading.textContent = title;
        element.appendChild(heading);
        return element;
      }

      function render(match) {
        if (!match?.date) return;
        root.replaceChildren();

        const scoreboard = document.createElement("header");
        scoreboard.className = "scoreboard";
        const context = document.createElement("p");
        context.className = "context";
        context.textContent = text(match.competition, "Match archive") +
          " · " + formatDate(match.date);
        const teams = document.createElement("div");
        teams.className = "teams";
        const home = document.createElement("p");
        home.className = "team";
        home.textContent = text(match.homeTeam);
        const result = document.createElement("div");
        result.className = "result";
        result.textContent = text(match.score);
        const away = document.createElement("p");
        away.className = "team";
        away.textContent = text(match.awayTeam);
        teams.append(home, result, away);
        scoreboard.append(context, teams);
        root.appendChild(scoreboard);

        const body = document.createElement("div");
        body.className = "body";
        const facts = document.createElement("dl");
        facts.className = "facts";
        facts.append(
          fact("Venue", match.venue),
          fact("Attendance", match.attendance?.toLocaleString?.() || match.attendance),
          fact("Formation", match.formation),
          fact("Referee", match.referee)
        );
        body.appendChild(facts);

        if (Array.isArray(match.goals) && match.goals.length) {
          const goalsSection = section("Rovers scorers");
          const scorers = document.createElement("div");
          scorers.className = "scorers";
          match.goals.forEach((goal) => {
            const pill = document.createElement("span");
            pill.className = "pill";
            pill.textContent = text(goal.scorer);
            if (goal.minute) {
              const minute = document.createElement("span");
              minute.className = "minute";
              minute.textContent = " " + goal.minute + "′";
              pill.appendChild(minute);
            }
            scorers.appendChild(pill);
          });
          goalsSection.appendChild(scorers);
          body.appendChild(goalsSection);
        }

        if (Array.isArray(match.lineup) && match.lineup.length) {
          const lineupSection = section("Rovers XI");
          const lineup = document.createElement("div");
          lineup.className = "lineup";
          match.lineup.forEach((player) => {
            const pill = document.createElement("span");
            pill.className = "pill";
            pill.textContent = (player.number ? player.number + " · " : "") +
              text(player.name);
            lineup.appendChild(pill);
          });
          lineupSection.appendChild(lineup);
          body.appendChild(lineupSection);
        }

        if (match.report) {
          const reportSection = section("The story of the game");
          const report = document.createElement("p");
          report.className = "report";
          report.textContent = text(match.report).replace(/<[^>]+>/g, " ");
          reportSection.appendChild(report);
          body.appendChild(reportSection);
        }

        const footer = document.createElement("footer");
        footer.className = "footer";
        const link = document.createElement("a");
        link.className = "link";
        link.href = text(match.matchUrl, "#");
        link.target = "_blank";
        link.rel = "noreferrer";
        link.textContent = "Open full match report →";
        footer.appendChild(link);
        body.appendChild(footer);
        root.appendChild(body);
      }

      function renderOutput(output) {
        render(output?.match ?? output?.structuredContent?.match);
      }

      const initializeRequestId = 1;

      window.addEventListener("message", (event) => {
        if (event.source !== window.parent) return;
        const message = event.data;
        if (!message || message.jsonrpc !== "2.0") return;

        if (message.id === initializeRequestId && message.result) {
          window.parent.postMessage({
            jsonrpc: "2.0",
            method: "ui/notifications/initialized"
          }, "*");
          return;
        }

        if (message.method === "ui/notifications/tool-result") {
          renderOutput(message.params);
        }
      }, { passive: true });

      window.addEventListener("openai:set_globals", (event) => {
        renderOutput(event.detail?.globals?.toolOutput);
      }, { passive: true });

      renderOutput(window.openai?.toolOutput);

      window.parent.postMessage({
        jsonrpc: "2.0",
        id: initializeRequestId,
        method: "ui/initialize",
        params: {
          protocolVersion: "2026-01-26",
          appCapabilities: {
            availableDisplayModes: ["inline"]
          },
          appInfo: {
            name: "Tranmere match card",
            version: "1.0.0"
          }
        }
      }, "*");
    </script>
  </body>
</html>
`.trim();
