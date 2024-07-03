'use client';

import algoliasearch from 'algoliasearch/lite';
import { Hit as AlgoliaHit } from 'instantsearch.js';
import React, { ReactNode } from 'react';
import {
  Hits,
  Highlight,
  SearchBox,
  RefinementList,
  DynamicWidgets,
  useInstantSearch,
  InstantSearch
} from 'react-instantsearch';
import 'instantsearch.css/themes/reset.css';
// Or include the full Satellite theme
import 'instantsearch.css/themes/satellite.css';

import { Panel } from '@/components/Panel';

const client = algoliasearch('DZJXSVOWI3', 'c050f0bd17ccfde9aa78a3563d552db2');

type HitProps = {
  hit: AlgoliaHit<{
    name: string;
    picLink: string;
    description: string;
    link: string
  }>;
};

type QueryBoundary = {
  children: ReactNode,
  fallback?: ReactNode
}

function EmptyQueryBoundary(options: QueryBoundary ) {
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
    <div className="aa-ItemWrapper" onClick={() => window.location.href = hit.link}>
        <div className="aa-ItemContent">
         {hit.picLink ? (
            <div className="aa-ItemIcon aa-ItemIcon--picture aa-ItemIcon--alignTop">      
              <img
                  src={hit.picLink}
                  alt={hit.name}
                  width="40"
                  height="40"
              />
            </div>
          ) : (
            ""
          )}
          
            <div className="aa-ItemContentBody">
                <div className="aa-ItemContentTitle">
                    <Highlight hit={hit} attribute="name" className="Hit-label" />
                </div>
                <div className="aa-ItemContentDescription">
                    {hit.description}
                </div>
            </div>
        </div>
    </div>  
  );
}

export default function Search() {
  return (
    <div id="autocomplete">
        <InstantSearch searchClient={client} indexName="TranmereWeb" future={{preserveSharedStateOnUnmount: true}} >
        <div className="algolia-autocomplete">
            <div>
                <DynamicWidgets fallbackComponent={FallbackComponent} />
            </div>
            <div>
                <SearchBox searchAsYouType={true} />
                <EmptyQueryBoundary fallback={null}>
                    <Hits hitComponent={Hit} />
                </EmptyQueryBoundary>
            </div>
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