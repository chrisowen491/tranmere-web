import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import { z } from "zod";
import { Profile } from "./types";

export class MyMCP extends McpAgent {
	
	server = new McpServer({
		name: "TranmereWeb MCP",
		version: "1.0.0",
		options: {}
	});

	async init() {

		this.server.tool("search", "Searches the TranmereWeb database", { query: z.string() }, 
			async ({ query }) => {
			const apiQuery = await fetch(
				`https://api.tranmere-web.com/page/player/${query}`
				);

				const profile = await apiQuery.json() as Profile;
				profile.image = profile.player.picLink;
				delete profile.appearances;

				return {
					content: [{ type: "text", text: String(JSON.stringify({results: [{id: query, title: query, url: `https://api.tranmere-web.com/page/player/${query}`}]})) }],
				};
			}
		);

		this.server.tool("fetch", "Gets an item from the TranmereWeb database", { id: z.string() }, 
			async ({ id }) => {
			const query = await fetch(
				`https://api.tranmere-web.com/page/player/${id}`
				);

				const profile = await query.json() as Profile;
				delete profile.appearances;

				return {
					content: [{ type: "text", text: String(JSON.stringify(profile)) }],
				};
			}
		);

		this.server.resource( "profile-widget",
			"ui://widget/profile.html",
			{},
			async () => ({
				contents: [
					{
						uri: "ui://widget/profile.html",
						mimeType: "text/html+skybridge",
						text: `
							<div id="profile-root"></div>
							<link rel="stylesheet" href="https://mcp.chrisowen491.workers.dev/profile-f0b8.css">
							<script type="module" src="https://mcp.chrisowen491.workers.dev/profile-f0b8.js"></script>
						`.trim(),
						responseText: "Rendered a pizza map!",
						_meta: {
							"openai/widgetCSP": {
								connect_domains: ["https://mcp.chrisowen491.workers.dev", "https://www.tranmere-web.com"],
								resource_domains: ["https://persistent.oaistatic.com", "https://mcp.chrisowen491.workers.dev", "https://www.tranmere-web.com"],
							}
						},
					},
				],
			})
		);

		this.server.registerTool("PlayerProfileTool", 
			{
				title: "TRFC Player Profile",
				description: "Get a profile for a Tranmere Rovers player by name",
				_meta: {
					"openai/outputTemplate": "ui://widget/profile.html",
					"openai/toolInvocation/invoking": "Displaying the profile",
					"openai/toolInvocation/invoked": "Displayed the profile",
					"openai/widgetAccessible": true,
    				"openai/resultCanProduceWidget": true
				},
				inputSchema: { player: z.string().describe("The name of the player to get the profile for") },
			},
			async ({ player }) => {
				const query = await fetch(
				`https://api.tranmere-web.com/page/player/${player}`
				);

				const profile = await query.json() as Profile;
				if(profile && profile.player) {
					profile.image = profile.player.picLink;
				}
				delete profile.appearances;

				return {
					structuredContent: {
						profile
					},
					content: [{ type: "text", text: "Rendered a player profile" }],
					_meta: {
						//tasksById: board.tasksById, // full task map for the component only
						//lastSyncedAt: board.lastSyncedAt
					}
				};
			}
		);
	}
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const url = new URL(request.url);

		if (url.pathname === "/sse" || url.pathname === "/sse/message") {
			return MyMCP.serveSSE("/sse").fetch(request, env, ctx);
		}

		if (url.pathname === "/mcp") {
			return MyMCP.serve("/mcp").fetch(request, env, ctx);
		}

		if(url.pathname.startsWith("/profile")) {

			console.log("Fetching asset:", request.url);
			const obj = await env.ASSETS.fetch(request.url);

			if(obj.status === 404) {
				return new Response("Not found", { status: 404 });
			} else {
				const res = new Response(obj.body, obj);
				res.headers.set("Access-Control-Allow-Origin", "*");
				res.headers.set("Access-Control-Allow-Methods", "GET,HEAD,POST,OPTIONS");
				res.headers.set("Access-Control-Max-Age", "86400");
				return res;
			}

		}

		return new Response("Not found", { status: 404 });
	},
};
