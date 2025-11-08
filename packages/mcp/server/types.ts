import { Document } from "@contentful/rich-text-types";

export interface Profile {
  debut: Debut
  seasons: Season[]
  transfers: Transfer[]
  links: Link[]
  image: string
  player: Player
  appearances?: Appearance[]
}

export interface Debut {
  Date: string
  Season: string
  YellowCard: string
  Competition: string
  Number: string
  SubYellow: string
  SubRed: string
  SubTime: string
  SubbedBy: string
  Opposition: string
  RedCard: string
  id: string
  Name: string
  Type: string
  Goals: number
}

export interface Season {
  Season: string
  starts: number
  TimeToLive: number
  assists: number
  penalties: number
  Player: string
  goals: number
  headers: number
  subs: number
  red: number
  yellow: number
  freekicks: number
  Apps: number
}

export interface Transfer {
  value: string
  cost: number
  season: number
  from: string
  to: string
  id: string
  name: string
  club: string
  type: string
}

export interface Link {
  link: string
  description: string
  id: string
  name: string
}

export interface Player {
  biography: Document
  placeOfBirth: string
  height: any
  dateOfBirth: any
  picLink: string
  id: string
  name: string
  position: string
}

export interface Appearance {
  Date: string
  Season: string
  YellowCard: string
  Competition: string
  Number: string
  SubYellow: string
  SubRed: string
  SubTime: string
  SubbedBy: string
  Opposition: string
  RedCard: string
  id: string
  Name: string
  Type: string
  Goals: number
}
