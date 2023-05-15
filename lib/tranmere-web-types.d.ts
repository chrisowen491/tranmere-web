import { Document } from '@contentful/rich-text-types';
import {IPageMetaDataFields} from './contentful'

export interface BaseView {
    name: string;
    objectID?: string;
    link?: string;
    picLink?: string;
    description?: string;
    meta?: string;
}

export interface BaseEntity {
    name: string;
    objectID?: string;
    link?: string;
    picLink?: string;
    description?: string;
    meta?: string;
}

export interface Player extends BaseEntity {
    id?: string;	
    biography?: string;	
    foot?: string;	
    links?: string;	
    pic?: string;	
    position?: string;
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
    height?: number;
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

export interface Page extends IPageMetaDataFields {
    
    name: string;
    description: string;

    content?: string;
    blogs: any;
    sectionHTML? : string;
    blockHTML? : string;
    cardBlocksHTML?: string;

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
    scrape_id?: string,
    id?: string;
    date: string;
    competition?: string;
    programme?: string;
    youtube?: string;
    pens?: string;
    home?: string;
    visitor?: string;
    opposition?: string;
    venue?: string;
    static?: string;
    season?: number;
    hgoal?: string;
    vgoal?: string;
    ft?: string;
    day?: string;
    attendance?: number;
}

export interface MatchView extends Match  {
    goals?: Array<Goal>;
    apps?: Array<Appearance>;
    largeProgramme?: string;
    goalkeepers?: Array<Appearance>;
    fullback1?: Array<Appearance>;
    fullback2?: Array<Appearance>;
    defenders?: Array<Appearance>;
    midfielders?: Array<Appearance>;
    wingers1?: Array<Appearance>;
    wingers2?: Array<Appearance>;
    strikers?: Array<Appearance>;
    formattedGoals?: string;
    hasVenue?: boolean;
    hasAttendance?: boolean;
    defColspan?: number;
    midColspan?: number;
    strColspan?: number;
    random?: number;
    url?: string;
    title?: string;
    pageType?: string;
    description?: string;
}

export interface Goal {
    id?: string;
    Date: string;
    GoalType?: string;
    Minute?: string;
    Opposition: string;
    Scorer: string;
    Assist?: string;
    AssistType?: string;
    Season?: string;
}

export interface Appearance {
    id: string;
    Date: string;
    Opposition: string;
    Competition:  string;
    Season: string;
    Name: string;
    Number: string | null | undefined;
    SubbedBy: string | null | undefined;
    SubTime: string | null | undefined;
    YellowCard: string | null | undefined;
    RedCard: string | null | undefined;
    SubYellow: string | null | undefined;
    SubRed: string | null | undefined;
    bio?: Player;
}

export interface Transfer {
    id: string;
    name: string;
    season: number;
    from: string;
    to: string;
    value: string;
    cost: number;
}

export interface BasePageView {
    random?: number;
    title?: string;
    pageType?: string;
    description?: string;
 
}

export interface HomeView extends BasePageView {
    blogs?: Entry<IBlogPost>[];
}

export interface TagView extends BasePageView {
    items?: any,
    url?: string;
}

// ToDo
export interface PlayerView extends BasePageView {
    title?: string;
    pageType?: string;
    description?: string;
    blogs?: Entry<IBlogPost>[];
    name?: string;
    debut?: any,
    seasons?: any,
    transfers?: any,
    links?: any,
    teams?: Team[],
    player?: any,
    url?: string;
    image?: string;
}

// ToDo
export interface BlogView extends BasePageView {
    title?: string;
    pageType?: string;
    description?: string;
    blogs?: Entry<IBlogPost>[];
    name?: string;
    debut?: any,
    seasons?: any,
    transfers?: any,
    links?: any,
    teams?: Team[],
    player?: any,
    url?: string;
    image?: string;
}