export const PLAYERS_UI_URI = 'ui://tranmere-web/players-v8.html';

export const playersWidgetHtml = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      :root {
        color-scheme: light dark;
        --navy: #071d49;
        --blue: #0057a8;
        --green: #009b77;
        --ink: light-dark(#10213b, #f4f7fb);
        --muted: light-dark(#64748b, #aebbd0);
        --surface: light-dark(#ffffff, #13213a);
        --soft: light-dark(#edf3f8, #1d2c48);
        --line: light-dark(#d9e3ec, #31415f);
      }

      * { box-sizing: border-box; }

      body {
        margin: 0;
        color: var(--ink);
        background: transparent;
        font: 14px/1.45 ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      .shell {
        overflow: hidden;
        border: 1px solid var(--line);
        border-radius: 20px;
        background: var(--surface);
        box-shadow: 0 16px 40px rgb(7 29 73 / 10%);
      }

      .hero {
        position: relative;
        overflow: hidden;
        padding: 22px 24px 20px;
        color: white;
        background:
          radial-gradient(circle at 88% 10%, rgb(0 155 119 / 55%), transparent 34%),
          linear-gradient(120deg, var(--navy), var(--blue));
      }

      .hero::after {
        position: absolute;
        inset: 0;
        content: "";
        opacity: .13;
        background: repeating-linear-gradient(115deg, transparent 0 18px, white 19px 20px);
        pointer-events: none;
      }

      .eyebrow {
        position: relative;
        z-index: 1;
        margin: 0 0 4px;
        color: #8ff2d4;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: .16em;
        text-transform: uppercase;
      }

      h1 {
        position: relative;
        z-index: 1;
        margin: 0;
        font-size: clamp(22px, 5vw, 34px);
        line-height: 1.05;
        letter-spacing: -.035em;
      }

      .summary {
        position: relative;
        z-index: 1;
        margin: 8px 0 0;
        color: rgb(255 255 255 / 78%);
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
        gap: 12px;
        max-height: 560px;
        padding: 16px;
        overflow: auto;
      }

      .card {
        display: grid;
        grid-template-columns: 76px minmax(0, 1fr);
        min-height: 112px;
        overflow: hidden;
        border: 1px solid var(--line);
        border-radius: 14px;
        color: inherit;
        background: var(--soft);
        text-decoration: none;
        transition: transform 150ms ease, border-color 150ms ease, box-shadow 150ms ease;
      }

      .card:hover {
        transform: translateY(-2px);
        border-color: var(--green);
        box-shadow: 0 10px 22px rgb(7 29 73 / 12%);
      }

      .portrait {
        position: relative;
        min-height: 112px;
        overflow: hidden;
        background: linear-gradient(155deg, var(--blue), var(--green));
      }

      .portrait img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: top center;
      }

      .initials {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        color: white;
        font-size: 22px;
        font-weight: 850;
        letter-spacing: -.04em;
      }

      .details {
        min-width: 0;
        padding: 14px 14px 12px;
      }

      .name {
        margin: 0;
        overflow: hidden;
        font-size: 16px;
        font-weight: 800;
        line-height: 1.2;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .position {
        display: inline-flex;
        margin-top: 7px;
        padding: 3px 8px;
        border-radius: 999px;
        color: light-dark(#00654f, #8ff2d4);
        background: light-dark(#d8f5eb, #123f3a);
        font-size: 11px;
        font-weight: 750;
      }

      .meta {
        margin: 8px 0 0;
        overflow: hidden;
        color: var(--muted);
        font-size: 12px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .bio {
        display: -webkit-box;
        margin: 9px 0 0;
        overflow: hidden;
        color: var(--muted);
        font-size: 12px;
        line-height: 1.45;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 3;
      }

      .empty {
        padding: 34px 24px;
        color: var(--muted);
        text-align: center;
      }

      @media (max-width: 520px) {
        .hero { padding: 18px; }
        .grid { grid-template-columns: 1fr; padding: 12px; }
      }

      @media (prefers-reduced-motion: reduce) {
        .card { transition: none; }
      }
    </style>
  </head>
  <body>
    <main class="shell">
      <header class="hero">
        <p class="eyebrow">Tranmere Rovers archive</p>
        <h1>Player profiles</h1>
        <p class="summary" id="summary">Loading players…</p>
      </header>
      <section class="grid" id="players" aria-live="polite"></section>
    </main>

    <script>
      const playersElement = document.getElementById("players");
      const summaryElement = document.getElementById("summary");

      function initials(name) {
        return String(name || "?")
          .split(/\\s+/)
          .filter(Boolean)
          .slice(0, 2)
          .map((part) => part[0])
          .join("")
          .toUpperCase();
      }

      function formatBorn(player) {
        const parts = [];
        if (player.dateOfBirth) {
          const date = new Date(player.dateOfBirth + "T12:00:00Z");
          parts.push(Number.isNaN(date.valueOf())
            ? player.dateOfBirth
            : new Intl.DateTimeFormat(document.documentElement.lang || "en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
                timeZone: "UTC"
              }).format(date));
        }
        if (player.placeOfBirth) parts.push(player.placeOfBirth);
        return parts.join(" · ");
      }

      function createCard(player) {
        const card = document.createElement("a");
        card.className = "card";
        card.href = "https://www.tranmere-web.com/page/player/" +
          encodeURIComponent(String(player.name || ""));
        card.target = "_blank";
        card.rel = "noreferrer";

        const portrait = document.createElement("div");
        portrait.className = "portrait";

        const fallback = document.createElement("span");
        fallback.className = "initials";
        fallback.textContent = initials(player.name);
        portrait.appendChild(fallback);

        if (player.picLink) {
          const image = document.createElement("img");
          image.src = String(player.picLink);
          image.alt = "";
          image.loading = "lazy";
          image.addEventListener("load", () => fallback.remove());
          image.addEventListener("error", () => image.remove());
          portrait.appendChild(image);
        }

        const details = document.createElement("div");
        details.className = "details";

        const name = document.createElement("p");
        name.className = "name";
        name.textContent = String(player.name || "Unknown player");
        details.appendChild(name);

        if (player.position) {
          const position = document.createElement("span");
          position.className = "position";
          position.textContent = String(player.position);
          details.appendChild(position);
        }

        const born = formatBorn(player);
        if (born) {
          const meta = document.createElement("p");
          meta.className = "meta";
          meta.textContent = born;
          details.appendChild(meta);
        }

        if (player.biographyMarkdown) {
          const biography = document.createElement("p");
          biography.className = "bio";
          biography.textContent = String(player.biographyMarkdown)
            .replace(/[#*_>\\[\\]\`]/g, "")
            .replace(/\\s+/g, " ")
            .trim();
          details.appendChild(biography);
        }

        card.append(portrait, details);
        return card;
      }

      function render(output) {
        const players = Array.isArray(output?.players) ? output.players : [];
        const totalCount = Number.isInteger(output?.totalCount)
          ? output.totalCount
          : players.length;
        const page = Number.isInteger(output?.page) ? output.page : 1;
        const pageSize = Number.isInteger(output?.pageSize)
          ? output.pageSize
          : players.length;
        const first = players.length ? (page - 1) * pageSize + 1 : 0;
        const last = players.length ? first + players.length - 1 : 0;
        summaryElement.textContent = !players.length
          ? totalCount
            ? "No players on page " + page
            : "No matching players found"
          : totalCount === 1
            ? "1 player found"
            : "Showing " + first + "–" + last + " of " + totalCount + " players";
        playersElement.replaceChildren();

        if (!players.length) {
          const empty = document.createElement("div");
          empty.className = "empty";
          empty.textContent = "No matching players found.";
          playersElement.appendChild(empty);
          return;
        }

        const fragment = document.createDocumentFragment();
        players.forEach((player) => fragment.appendChild(createCard(player)));
        playersElement.appendChild(fragment);
      }

      function parseOutput(output) {
        if (typeof output === "string") {
          try {
            return parseOutput(JSON.parse(output));
          } catch {
            return null;
          }
        }

        const candidates = [
          output?.structuredContent,
          output?.toolOutput,
          output?.result?.structuredContent,
          output?.result,
          output?.widgetState,
          output?.globals?.widgetState,
          output?.globals?.toolOutput,
          output
        ];
        return candidates.find((candidate) => Array.isArray(candidate?.players)) || null;
      }

      function renderOutput(output) {
        const parsed = parseOutput(output);
        if (parsed) render(parsed);
        return parsed;
      }

      function saveWidgetState(output) {
        if (typeof window.openai?.setWidgetState !== "function") return;

        const parsed = parseOutput(output);
        if (!parsed) return;

        Promise.resolve(window.openai.setWidgetState({
          count: parsed.count,
          totalCount: parsed.totalCount,
          page: parsed.page,
          pageSize: parsed.pageSize,
          players: parsed.players
        })).catch(() => {
          // Widget state is a progressive enhancement; live tool output still renders.
        });
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
          const output = message.params?.structuredContent ?? message.params?.result ?? message.params;
          renderOutput(output);
          saveWidgetState(output);
        }
      }, { passive: true });

      window.addEventListener("openai:set_globals", (event) => {
        const globals = event.detail?.globals ?? event.detail ?? {};
        renderOutput(globals.widgetState);
        const output = globals.toolOutput;
        if (renderOutput(output)) saveWidgetState(output);
      }, { passive: true });

      renderOutput(window.openai?.widgetState);
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
            name: "Tranmere player profiles",
            version: "1.0.0"
          }
        }
      }, "*");
    </script>
  </body>
</html>
`.trim();
