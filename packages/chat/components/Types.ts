import { PlayerSeasonSummary } from '@tranmere-web/lib/src/tranmere-web-types';
import type { Message } from 'ai/react';

export interface ExtendedMessage extends Message {
    avatar?: string; 
    type?: "chat" | "match" | "player" | "players",
    match?: MatchToolResponse
    players?: PlayerSeasonSummary[];
    player?: PlayerSeasonSummary;
}

export interface MatchToolResponse {
    season: string
    score: string
    date: string
    attendance: number
    competition: string
    pens: string
    homeTeam: string
    awayTeam: string
    report: any
    team: string[]
    goals: string[]
    substitutes: string[]
  }

export interface ComplexChatResponse {
    output: string
    intermediate_steps: IntermediateStep[]
    avatar: string
    error?: string;
  }
  
  export interface IntermediateStep {
    action: Action
    observation: string
  }
  
  export interface Action {
    tool: string
    toolInput: ToolInput
    toolCallId: string
    log: string
    messageLog: MessageLog[]
  }
  
  export interface ToolInput {
    season: number
    date?: string
  }
  
  export interface MessageLog {
    lc: number
    type: string
    id: string[]
    kwargs: Kwargs
  }
  
  export interface Kwargs {
    content: string
    additional_kwargs: AdditionalKwargs
    response_metadata: ResponseMetadata
    tool_call_chunks: ToolCallChunk[]
    tool_calls: ToolCall2[]
    invalid_tool_calls: any[]
  }
  
  export interface AdditionalKwargs {
    tool_calls: ToolCall[]
  }
  
  export interface ToolCall {
    index: number
    id: string
    type: string
    function: Function
  }
  
  export interface Function {
    name: string
    arguments: string
  }
  
  export interface ResponseMetadata {
    prompt: number
    completion: number
    finish_reason: string
  }
  
  export interface ToolCallChunk {
    name: string
    args: string
    id: string
    index: number
  }
  
  export interface ToolCall2 {
    name: string
    args: Args
    id: string
  }
  
  export interface Args {
    season: number
    date?: string
  }
  