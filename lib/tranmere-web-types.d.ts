import { Document } from '@contentful/rich-text-types';

export interface BaseEntity {
    name: string;
    objectID?: string;
    link?: string;
    picLink?: string;
    description?: string;
    meta?: string;
}

export interface Player extends BaseEntity {
}

export interface Manager {
    name: string;
    dateJoined: number;
    dateLeft: string;
    dateLeftText?: string;
}

export interface Team  extends BaseEntity{
}

export interface Competition extends BaseEntity {
}

export interface Season {
    verbose?: boolean;
}


export interface ImageEdits {
    resize?: ImageResize;
}

export interface ImageResize {
    width: number;
    height: number;
    fit: string;
}

export interface SiteMapEntry {
    url: string;
    date: string;
    priority: number;
    changes: string;
}

export interface Image {
    
    bucket: string;
    key: string;
    edits?: ImageEdits;
}

export interface HatTrick {
    Date: string;
    Player: string;
    Opposition: string;
    Goals: number;
    Season: number;
}

export interface Page {
    
    name: string;
    description: string;
    key: string;
    template: string;

    content?: string;
    blogs: any;
    body: Document;
    sectionHTML? : string;
    blockHTML? : string;
    cardBlocksHTML?: string;

    sections: Array<any>;
    blocks: Array<any>;
    cardBlocks: Array<any>;

    dd_app?: string;
    dd_version?: string;
    image?: string;
    topScorers: Array<Player>;
    hatTricks: Array<HatTrick>;
    managers: Array<Manager>;
    players: Array<Player>;
    teams: Array<Team>;
    competitions: Array<Competition>;
    seasons: Array<number>;
}

export interface Match {
    verbose?: boolean;
}