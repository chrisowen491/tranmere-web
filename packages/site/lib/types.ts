import { Document } from "@contentful/rich-text-types";
import {
  Appearance,
  Player,
  PlayerSeasonSummary,
  Transfer,
} from "@tranmere-web/lib/src/tranmere-web-types";
import type { Message } from "ai/react";

export type SlugParams = Promise<{ slug: string }>;
export type MatchParams = Promise<{ season: string; date: string }>;

export interface PlayerName {
  name: string;
}

export interface GraphQLPlayerResponse {
  data: {
    playerCollection: {
      items: PlayerName[];
    };
  };
}

export interface GraphQLBlogResponse {
  data: {
    blogPostCollection: {
      items: BlogItem[];
    };
  };
}

export interface GraphQLAssetsResponse {
  data: {
    assetCollection: {
      items: GalleryImage[];
    };
  };
}

export interface GalleryImage {
  title: string;
  description: string;
  url: string;
}

export interface Block {
  __typename: "Kit" | "Star" | "Graph";
  season?: string;
  img?: string;
  name?: string;
  date?: string;
  notes?: string;
  match?: string;
  programme?: string;
  title?: string;
  chart?: ChartData;
}

export interface ChartData {
  data: Chart;
}

export interface Chart {
  labels: string[];
  datasets: DataSet[];
}

export interface DataSet {
  data: number[];
  label: string;
  borderColor: string;
  backgroundColor: string;
}

export interface BlogItem {
  sys: Sys;
  title: string;
  slug: string;
  description: string;
  author: string;
  galleryCollection: {
    items: GalleryImage[];
  };
  blocksCollection: {
    items: Block[];
  };
  pic: Pic;
  blog: Blog;
  galleryTag?: string;
  datePosted: string;
  tags: string[];
}

export interface Sys {
  id: string;
}

export interface Pic {
  url: string;
}

export interface Blog {
  json: Document;
}

export interface ExtendedMessage extends Message {
  avatar?: string;
  type?: "chat" | "match" | "player" | "players";
  match?: MatchPageData;
  players?: PlayerSeasonSummary[];
  player?: PlayerSeasonSummary;
}

export interface MatchPageData {
  season: string;
  score: string;
  date: string;
  attendance: number;
  competition: string;
  pens: string;
  homeTeam: string;
  awayTeam: string;
  report: string;
  referee: string;
  team: string[];
  goals: string[];
  substitutes: string[];
  programme: string;
  venue: string;
  apps: Appearance[];
  formattedGoals: string;
}

export interface ComplexChatResponse {
  output: string;
  intermediate_steps: IntermediateStep[];
  avatar: string;
  error?: string;
}

export interface IntermediateStep {
  action: Action;
  observation: string;
}

export interface Action {
  tool: string;
  toolInput: ToolInput;
  toolCallId: string;
  log: string;
  messageLog: MessageLog[];
}

export interface ToolInput {
  season: number;
  date?: string;
}

export interface MessageLog {
  lc: number;
  type: string;
  id: string[];
  kwargs: Kwargs;
}

export interface Kwargs {
  content: string;
  additional_kwargs: AdditionalKwargs;
  response_metadata: ResponseMetadata;
  tool_call_chunks: ToolCallChunk[];
  tool_calls: ToolCall2[];
  invalid_tool_calls: any[];
}

export interface AdditionalKwargs {
  tool_calls: ToolCall[];
}

export interface ToolCall {
  index: number;
  id: string;
  type: string;
  function: Function;
}

export interface Function {
  name: string;
  arguments: string;
}

export interface ResponseMetadata {
  prompt: number;
  completion: number;
  finish_reason: string;
}

export interface ToolCallChunk {
  name: string;
  args: string;
  id: string;
  index: number;
}

export interface ToolCall2 {
  name: string;
  args: Args;
  id: string;
}

export interface Args {
  season: number;
  date?: string;
}

export interface PlayerProfile {
  debut: Appearance;
  seasons: PlayerSeasonSummary[];
  transfers: Transfer[];
  links: HyperLink[];
  image: string;
  player: Player;
  appearances: Appearance[];
}

export interface Breadcrumb {
  link?: Link[];
  active?: Active[];
}

export interface HyperLink {
  id: string;
  link: string;
  name: string;
  description: string;
}

export interface Link {
  link: string;
  position: number;
  title: string;
}

export interface Active {
  position: number;
  title: string;
}
