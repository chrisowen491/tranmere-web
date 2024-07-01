import { Document } from "@contentful/rich-text-types";

export interface GraphQLResponse {
  data: Data;
}

export interface Data {
  blogPostCollection: BlogPostCollection;
}

export interface BlogPostCollection {
  items: Item[];
}

export interface Item {
  sys: Sys;
  title: string;
  slug: string;
  description: string;
  author: string;
  pic: Pic;
  blog: Blog;
}

export interface Sys {
  id: string;
}

export interface Pic {
  url: string;
}

export interface Blog {
  json: Document;
  links: Links;
}