import { autocomplete, getAlgoliaResults } from '@algolia/autocomplete-js';
import algoliasearch from 'algoliasearch/lite';

import '@algolia/autocomplete-theme-classic';

const appId = 'DZJXSVOWI3';
const apiKey = 'c050f0bd17ccfde9aa78a3563d552db2';
const searchClient = algoliasearch(appId, apiKey);

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
