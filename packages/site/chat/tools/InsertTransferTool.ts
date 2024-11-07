import { DynamicStructuredTool } from "@langchain/core/tools";
import { v4 as uuidv4 } from 'uuid';
import { z } from "zod";

export const InsertTransferTool = new DynamicStructuredTool({
    name: 'tranmere-web-insert-transfers-tool',
    description: 'Add transfers to our player database',
    schema: z.object({
        player: z
        .string()
        .describe(
          'The name of the player involved in the transfer'
        ),
        season: z
        .number()
        .describe(
          'The season the transfer occured'
        ),
        cost: z
        .number()
        .describe(
          'The numeric value of the trasnfer - free transfers should be 0'
        ),
        value: z
        .string()
        .describe(
          'The value of the transfer including currency if relevant, or the type if a Free Transfer or a Loan'
        ),
        from: z
        .string()
        .describe(
          'The name of the club the player transferred from'
        ),
        to: z
        .string()
        .describe(
          'The name of the club the player transferred to'
        )
    }),
    func: async ({
      player,
      season,
      cost,
      value,
      from,
      to,
    }) => {
      
        const body = {
          "query":`mutation MyMutation { addTranmereWebPlayerTransfers(season: ${season}, id: "${uuidv4()}", cost: ${cost}, name: "${player}", value: "${value}", from: "${from}", to: "${to}") { id } }`,
          "variables":null,
          "operationName":"MyMutation"
        }

        const query = await fetch(`https://api.tranmere-web.com/graphql`, {
          method: 'POST',
          body: JSON.stringify(body),
          headers: {
            'Content-Type': 'application/json',
          }
        })
        console.log(query.status)
        console.log(JSON.stringify(body))
        console.log(await query.text())
        if(query.status !== 200) { 
          return "Transfer not added";

        } else 
        {
          return "Transfer added";
        }
    }
  })