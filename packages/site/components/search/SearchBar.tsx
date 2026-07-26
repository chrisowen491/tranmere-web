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
    <a href={hit.link} className="block">
      {hit.name}
    </a>
  );
}

export default function SearchBar({ className = "" }: { className?: string }) {
  return (
    <div className={`navsearch relative w-full ${className}`}>
      <InstantSearch
        searchClient={client}
        indexName="TranmereWeb"
        future={{ preserveSharedStateOnUnmount: true }}
      >
        <div className="algolia-autocomplete relative">
          <SearchBox searchAsYouType={true} placeholder="Search archive" />
          <EmptyQueryBoundary fallback={null}>
            <Hits hitComponent={Hit} />
          </EmptyQueryBoundary>
        </div>
      </InstantSearch>
    </div>
  );
}
