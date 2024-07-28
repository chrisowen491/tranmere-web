"use client";

import algoliasearch from "algoliasearch/lite";
import { Hit as AlgoliaHit } from "instantsearch.js";
import React, { ReactNode } from "react";
import "instantsearch.css/themes/reset.css";
import "instantsearch.css/themes/satellite.css";
import {
  Hits,
  SearchBox,
  RefinementList,
  useInstantSearch,
  InstantSearch,
} from "react-instantsearch";

import { Panel } from "@/components/search/Panel";

const client = algoliasearch("DZJXSVOWI3", "c050f0bd17ccfde9aa78a3563d552db2");

type HitProps = {
  hit: AlgoliaHit<{
    name: string;
    picLink: string;
    description: string;
    link: string;
  }>;
};

type QueryBoundary = {
  children: ReactNode;
  fallback?: ReactNode;
};

function EmptyQueryBoundary(options: QueryBoundary) {
  const { indexUiState } = useInstantSearch();

  if (!indexUiState.query) {
    return (
      <>
        <div hidden>{options.children}</div>
      </>
    );
  }

  return options.children;
}

function Hit({ hit }: HitProps) {
  return (
    <div
      className="aa-ItemWrapper"
      onClick={() => (window.location.href = hit.link)}
    >
      <div className="aa-ItemContent">
        <div className="aa-ItemContentBody">
          <div className="aa-ItemContentTitle dark:text-gray-600 dark:hover:text-gray-50 hover:text-gray-50">
            {hit.name}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchBar() {
  return (
    <div id="navsearch" className="w-full max-w-lg lg:max-w-xs">
      <InstantSearch
        searchClient={client}
        indexName="TranmereWeb"
        future={{ preserveSharedStateOnUnmount: true }}
      >
        <div className="algolia-autocomplete relative">
            <SearchBox searchAsYouType={true}  />
            <EmptyQueryBoundary fallback={null}>
              <Hits hitComponent={Hit} />
            </EmptyQueryBoundary>
        </div>
      </InstantSearch>
    </div>
  );
}

function FallbackComponent({ attribute }: { attribute: string }) {
  return (
    <Panel header={attribute}>
      <RefinementList attribute={attribute} />
    </Panel>
  );
}
