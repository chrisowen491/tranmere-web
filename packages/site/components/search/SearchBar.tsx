"use client";

import { liteClient } from "algoliasearch/lite";
import { Hit as AlgoliaHit } from "instantsearch.js";
import * as React from "react";
import "instantsearch.css/themes/reset.css";
import "instantsearch.css/themes/satellite.css";
import {
  Hits,
  SearchBox,
  useInstantSearch,
  InstantSearch,
} from "react-instantsearch";

const client = liteClient("DZJXSVOWI3", "c050f0bd17ccfde9aa78a3563d552db2");

type HitProps = {
  hit: AlgoliaHit<{
    name: string;
    picLink: string;
    description: string;
    link: string;
  }>;
};

type QueryBoundary = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
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
    <div className="" onClick={() => (window.location.href = hit.link)}>
      <div className="">
        <div className="">
          <div className=" dark:text-gray-600 dark:hover:text-gray-50 hover:text-gray-50">
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
          <SearchBox searchAsYouType={true} />
          <EmptyQueryBoundary fallback={null}>
            <Hits hitComponent={Hit} className="dark:bg-slate-950" />
          </EmptyQueryBoundary>
        </div>
      </InstantSearch>
    </div>
  );
}
