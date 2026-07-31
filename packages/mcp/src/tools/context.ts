import type { McpServer } from '@modelcontextprotocol/server';
import type { McpAuthContext } from '../auth';

export interface ToolContext {
  server: McpServer;
  env: Env;
  auth: McpAuthContext;
}
