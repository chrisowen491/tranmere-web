import { GetAllTranmereManagers } from "@/lib/apiFunctions";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

export const ManagerTool = new DynamicStructuredTool({
  name: "tranmere-web-manager-tool",
  description: "Get info about Tranmere Rovers managers",
  schema: z.object({}),
  func: async () => {
    const managers = await GetAllTranmereManagers();
    return JSON.stringify(managers);
  },
});
