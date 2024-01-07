// THIS FILE IS AUTOMATICALLY GENERATED. DO NOT MODIFY IT.

import { Asset, Entry } from "contentful";
import { Document } from "@contentful/rich-text-types";

export interface IBlogPostFields {
  /** Title */
  title?: string | undefined;

  /** Blog */
  blog?: Document | undefined;

  /** Date Posted */
  datePosted?: string | undefined;

  /** Picture */
  pic?: Asset | undefined;

  /** Gallery */
  gallery?: Asset[] | undefined;

  /** GalleryTag */
  galleryTag?: string | undefined;

  /** Blocks */
  blocks?: Entry<{ [fieldId: string]: unknown }>[] | undefined;

  /** CardBlocks */
  cardBlocks?: ILinkBlock[] | undefined;

  /** Tags */
  tags?:
    | ("Site Stuff" | "Tranmere News" | "Gallery" | "Stats" | "Reviews")[]
    | undefined;
}

/** A blog post on the site */

export interface IBlogPost extends Entry<IBlogPostFields> {
  contentTypeId: string;
  sys: {
    id: string;
    type: string;
    createdAt: string;
    updatedAt: string;
    locale: string;
    contentType: {
      sys: {
        id: "blogPost";
        linkType: "ContentType";
        type: "Link";
      };
    };
  };
}

export interface ICustomerFields {
  /** ID */
  id?: number | undefined;

  /** Name */
  name?: string | undefined;

  /** Colour */
  colour?: string | undefined;
}

export interface ICustomer extends Entry<ICustomerFields> {
  contentTypeId: string;
  sys: {
    id: string;
    type: string;
    createdAt: string;
    updatedAt: string;
    locale: string;
    contentType: {
      sys: {
        id: "customer";
        linkType: "ContentType";
        type: "Link";
      };
    };
  };
}

export interface IGraphFields {
  /** Title */
  title?: string | undefined;

  /** chart */
  chart?: Record<string, any> | undefined;
}

export interface IGraph extends Entry<IGraphFields> {
  sys: {
    id: string;
    type: string;
    createdAt: string;
    updatedAt: string;
    locale: string;
    contentType: {
      sys: {
        id: "graph";
        linkType: "ContentType";
        type: "Link";
      };
    };
  };
}

export interface IKitFields {
  /** season */
  season?: string | undefined;

  /** img */
  img?: string | undefined;
}

export interface IKit extends Entry<IKitFields> {
  sys: {
    id: string;
    type: string;
    createdAt: string;
    updatedAt: string;
    locale: string;
    contentType: {
      sys: {
        id: "kit";
        linkType: "ContentType";
        type: "Link";
      };
    };
  };
}

export interface ILinkBlockFields {
  /** Title */
  title?: string | undefined;

  /** Links */
  links?: Record<string, any> | undefined;
}

export interface ILinkBlock extends Entry<ILinkBlockFields> {
  sys: {
    id: string;
    type: string;
    createdAt: string;
    updatedAt: string;
    locale: string;
    contentType: {
      sys: {
        id: "linkBlock";
        linkType: "ContentType";
        type: "Link";
      };
    };
  };
}

export interface IPageMetaDataFields {
  /** Key */
  key?: string | undefined;

  /** Title */
  title?: string | undefined;

  /** Description */
  description?: string | undefined;

  /** Template */
  template?: string | undefined;

  /** Page Type */
  pageType?: string | undefined;

  /** Body */
  body?: Document | undefined;

  /** Sections */
  sections?: ("kits" | "managers" | "top-scorers" | "hat-tricks")[] | undefined;

  /** Blocks */
  blocks?: Entry<{ [fieldId: string]: unknown }>[] | undefined;

  /** Card Blocks */
  cardBlocks?: Entry<{ [fieldId: string]: unknown }>[] | undefined;
}

export interface IPageMetaData extends Entry<IPageMetaDataFields> {
  contentTypeId: string;
  sys: {
    id: string;
    type: string;
    createdAt: string;
    updatedAt: string;
    locale: string;
    contentType: {
      sys: {
        id: "pageMetaData";
        linkType: "ContentType";
        type: "Link";
      };
    };
  };
}

export interface IPlayerFields {
  /** Name */
  name?: string | undefined;

  /** Date Of Birth */
  dateOfBirth?: string | undefined;

  /** Biography */
  biography?: Document | undefined;

  /** Pic Link */
  picLink?: string | undefined;

  /** Foot */
  foot?: "Right" | "Left" | undefined;

  /** Height */
  height?: string | undefined;

  /** Place Of Birth */
  placeOfBirth?: string | undefined;

  /** Position */
  position?:
    | "Goalkeeper"
    | "Striker"
    | "Midfielder"
    | "Winger"
    | "Central Defender"
    | "Central Midfielder"
    | "Full Back"
    | undefined;
}

/** Player Biography */

export interface IPlayer extends Entry<IPlayerFields> {
  sys: {
    id: string;
    type: string;
    createdAt: string;
    updatedAt: string;
    locale: string;
    contentType: {
      sys: {
        id: "player";
        linkType: "ContentType";
        type: "Link";
      };
    };
  };
}

export interface IQuestionBlockFields {
  /** Name */
  name?: string | undefined;

  /** Block */
  block?: Record<string, any> | undefined;

  /** OptionsBlock */
  optionsBlock?: Record<string, any> | undefined;
}

export interface IQuestionBlock extends Entry<IQuestionBlockFields> {
  sys: {
    id: string;
    type: string;
    createdAt: string;
    updatedAt: string;
    locale: string;
    contentType: {
      sys: {
        id: "questionBlock";
        linkType: "ContentType";
        type: "Link";
      };
    };
  };
}

export interface IQuestionBlockEntryFields {
  /** Description */
  description?: string | undefined;

  /** QuestionBlock */
  questionBlock?: IQuestionBlock | undefined;

  /** ConditionDisplayRule */
  conditionDisplayRule?: string | undefined;

  /** RequireConfirmation */
  requireConfirmation?: boolean | undefined;

  /** Priority */
  priority?: number | undefined;

  /** RequiredForResults */
  requiredForResults?: boolean | undefined;

  /** Required Fields */
  requiredFields?: string[] | undefined;
}

export interface IQuestionBlockEntry extends Entry<IQuestionBlockEntryFields> {
  sys: {
    id: string;
    type: string;
    createdAt: string;
    updatedAt: string;
    locale: string;
    contentType: {
      sys: {
        id: "questionBlockEntry";
        linkType: "ContentType";
        type: "Link";
      };
    };
  };
}

export interface IStarFields {
  /** Name */
  name: string;

  /** Season */
  season: string;

  /** Date */
  date: string;

  /** Notes */
  notes: string;

  /** Match */
  match?: string | undefined;

  /** Programme */
  programme?: string | undefined;
}

export interface IStar extends Entry<IStarFields> {
  sys: {
    id: string;
    type: string;
    createdAt: string;
    updatedAt: string;
    locale: string;
    contentType: {
      sys: {
        id: "star";
        linkType: "ContentType";
        type: "Link";
      };
    };
  };
}

export interface IVideoFields {
  /** Name */
  name?: string | undefined;

  /** YouTube */
  youtube?: string | undefined;
}

export interface IVideo extends Entry<IVideoFields> {
  sys: {
    id: string;
    type: string;
    createdAt: string;
    updatedAt: string;
    locale: string;
    contentType: {
      sys: {
        id: "video";
        linkType: "ContentType";
        type: "Link";
      };
    };
  };
}

export type CONTENT_TYPE =
  | "blogPost"
  | "customer"
  | "graph"
  | "kit"
  | "linkBlock"
  | "pageMetaData"
  | "player"
  | "questionBlock"
  | "questionBlockEntry"
  | "star"
  | "video";

export type IEntry =
  | IBlogPost
  | ICustomer
  | IGraph
  | IKit
  | ILinkBlock
  | IPageMetaData
  | IPlayer
  | IQuestionBlock
  | IQuestionBlockEntry
  | IStar
  | IVideo;

export type LOCALE_CODE = "en-GB";

export type CONTENTFUL_DEFAULT_LOCALE_CODE = "en-GB";
