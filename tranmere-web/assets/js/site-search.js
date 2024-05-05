import { autocomplete, getAlgoliaResults } from '@algolia/autocomplete-js';
import algoliasearch from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js';
import { searchBox, hits, refinementList } from 'instantsearch.js/es/widgets';
import 'instantsearch.css/themes/reset.css';
import 'instantsearch.css/themes/satellite.css';

import '@algolia/autocomplete-theme-classic';

const appId = 'DZJXSVOWI3';
const apiKey = 'c050f0bd17ccfde9aa78a3563d552db2';
const searchClient = algoliasearch(appId, apiKey);
const indexName = 'TranmereWeb';

if ($('#autocomplete').length) {
  autocomplete({
    container: '#autocomplete',
    placeholder: 'Enter a player, opposition, year etc ...',
    classNames: {},

    getSources({ query }) {
      return [
        {
          sourceId: 'products',
          getItems() {
            return getAlgoliaResults({
              searchClient,
              queries: [
                {
                  indexName: 'TranmereWeb',
                  query
                }
              ]
            });
          },
          onSelect({ item }) {
            window.location.href = item.link;
          },
          getItemUrl({ item }) {
            return item.link;
          },
          templates: {
            item({ item, components, html }) {
              return html`<div class="aa-ItemWrapper">
                <div class="aa-ItemContent">
                  <div
                    class="aa-ItemIcon aa-ItemIcon--picture aa-ItemIcon--alignTop"
                  >
                    <img
                      src="${item.picLink}"
                      alt="${item.name}"
                      width="40"
                      height="40"
                    />
                  </div>

                  <div class="aa-ItemContentBody">
                    <div class="aa-ItemContentTitle">
                      ${components.Highlight({ hit: item, attribute: 'name' })}
                    </div>
                    <div class="aa-ItemContentDescription">
                      ${item.description}
                    </div>
                  </div>
                </div>
              </div>`;
            }
          }
        }
      ];
    },
    render({ children, render, html }, root) {
      render(html`<div class="aa-SomeResults">${children}</div>`, root);
    },
    renderNoResults({ children, render, html }, root) {
      render(html`<div class="aa-NoResults">${children}</div>`, root);
    }
  });
}

if ($('#searchresults').length) {
  // 1. Instantiate the search
  const search = instantsearch({
    searchClient,
    indexName,

    routing: {
      stateMapping: {
        stateToRoute(uiState) {
          const indexUiState = uiState[indexName];
          return {
            q: indexUiState.query,
            page: indexUiState.page
          };
        },
        routeToState(routeState) {
          return {
            [indexName]: {
              query: routeState.q,
              page: routeState.page
            }
          };
        }
      }
    }
  });

  search.addWidgets([
    // 2. Create an interactive search box
    searchBox({
      container: '#searchbox',
      placeholder: 'Enter a player, opposition, year etc ...'
    }),

    // 3. Plug the search results into the product container
    hits({
      container: '#searchresultspanel',
      templates: {
        item(hit, { html, components }) {
          return html`
            <div class="aa-ItemWrapper">
              <div class="aa-ItemContent">
                <div
                  class="aa-ItemIcon aa-ItemIcon--picture aa-ItemIcon--alignTop"
                >
                  <a href="${hit.link}">
                    <img
                      src="${hit.picLink}"
                      alt="${hit.name}"
                      width="40"
                      height="40"
                    />
                  </a>
                </div>

                <div class="aa-ItemContentBody">
                  <div class="aa-ItemContentTitle">
                    <a href="${hit.link}"
                      >${components.Highlight({ attribute: 'name', hit })}</a
                    >
                  </div>
                  <div class="aa-ItemContentDescription">
                    <a href="${hit.link}">${hit.description}</a>
                  </div>
                </div>
              </div>
            </div>
          `;
        }
      }
    })
  ]);

  // 5. Start the search!
  search.start();
}

if ($('#navsearch').length) {
  autocomplete({
    container: '#navsearch',
    placeholder: 'Search ...',
    classNames: {},
    getSources({ query }) {
      return [
        {
          sourceId: 'products',
          getItems() {
            return getAlgoliaResults({
              searchClient,
              queries: [
                {
                  indexName: 'TranmereWeb',
                  query
                }
              ]
            });
          },
          onSelect({ item }) {
            window.location.href = item.link;
          },
          getItemUrl({ item }) {
            return item.link;
          },
          templates: {
            item({ item, components, html }) {
              return html`<div class="aa-ItemWrapper">
                <div class="aa-ItemContent">
                  <div class="aa-ItemContentBody">
                    <div class="aa-ItemContentTitle">${item.name}</div>
                  </div>
                </div>
              </div>`;
            }
          }
        }
      ];
    },
    render({ children, render, html }, root) {
      render(html`<div class="aa-SomeResults">${children}</div>`, root);
    },
    renderNoResults({ children, render, html }, root) {
      render(html`<div class="aa-NoResults">${children}</div>`, root);
    }
  });
}
