"use client";
import { getSeasons } from '@/lib/apiFunctions';
import { useState } from 'react'

export function PlayerSearch() {
    const seasons = getSeasons();
    const base = '/player-search/'
    var dateobj = new Date();
    var theYear =
      dateobj.getUTCMonth() > 6 ? dateobj.getFullYear() : dateobj.getFullYear() - 1;

    const latestSeasonRequest = await fetch(base + `?season=` + theYear);
    const playerResults = await latestSeasonRequest.json();

    const [players, setPlayers] = useState('1966/simple/ffd3b3/none/000000/fcb98b/LightGray/8e740c')
 
    const seasonMapping = {
        1978: 1977,
        1984: 1983,
        1990: 1989,
        1992: 1991,
        1994: 1993,
        1996: 1995,
        1998: 1997,
        2001: 2000,
        2003: 2002,
        2005: 2006,
        2008: 2007
      };
    
    const onSubmit = async (formData: FormData) => {
        setImg(`${formData.get('kit')}/${formData.get('hair')}/${formData.get('skinColour')}/${formData.get('feature')}/${formData.get('colour')}/${formData.get('neckColour')}/${formData.get('background')}/${formData.get('highlights')}`)
    }

    /*


var dateobj = new Date();
var theYear =
  dateobj.getUTCMonth() > 6 ? dateobj.getFullYear() : dateobj.getFullYear() - 1;

function search() {
  $('#loading').show();
  $('#content').hide();
  var base = '';
  var url =
    base +
    '/player-search/?season=' +
    $('#season').val() +
    '&sort=' +
    $('#sort').val() +
    '&filter=' +
    $('#filter').val() +
    '&c=' +
    dateobj.getDate();
  var re = /\/\d\d\d\d\//gm;
  var re3 = /\/\d\d\d\d[A-Za-z]\//gm;
  $.getJSON(url, function (view) {
    $.get(
      '/assets/templates/players.mustache?v=' + pack.version,
      function (template) {
        if ($('#season').val() && $('#season').val() > 1976) {
          for (var i = 0; i < view.players.length; i++) {
            if (view.players[i].bio && view.players[i].bio.picLink) {
              var season = $('#season').val();
              if (seasonMapping[season]) season = seasonMapping[season];
              view.players[i].bio.picLink = view.players[i].bio.picLink.replace(
                re,
                '/' + season + '/'
              );
              view.players[i].bio.picLink = view.players[i].bio.picLink.replace(
                re3,
                '/' + season + '/'
              );
            }
          }
        }

        var article = Mustache.render(template, view);
        $('#player-search').html(article);
        $('#loading').hide();
        $('#player-search').show();
      }
    );
  });
}
$.urlParam = function (name) {
  var results = new RegExp('[?&]' + name + '=([^&#]*)').exec(
    window.location.search
  );

  return results !== null ? results[1] || 0 : false;
};

jQuery(function () {
  if ($('#player-search').length) {
    if ($("meta[name='season-ssr-id']").length) {
      $('#season').val($("meta[name='season-ssr-id']").attr('content'));
    }
    if ($("meta[name='filter-ssr-id']").length) {
      $('#filter').val($("meta[name='filter-ssr-id']").attr('content'));
    }
    if ($("meta[name='sort-ssr-id']").length) {
      $('#sort').val($("meta[name='sort-ssr-id']").attr('content'));
    }

    if (
      !$("meta[name='filter-ssr-id']").length &&
      !$("meta[name='sort-ssr-id']").length &&
      !$("meta[name='season-ssr-id']").length
    ) {
      $('#season').val(theYear);
    }

    if ($("meta[name='players-ssr-id']").length) {
      $('#loading').hide();
    } else {
      search();
    }

    $('.btn-player-search').on('click', function () {
      search();
    });
  }
});

    */
     
  return (
    <div className="container overlay-item-top">
        <div className="row">
            <div className="col">
                <div className="content boxed">
                    <div className="row separated">

                        <aside className="col-md-3 content-aside bg-light">
                            <div className="widget">
                                <form action={onSubmit}>
                                    <h3 className="widget-title">Filter</h3>
                                    <div className="form-group">
                                    <label htmlFor="season">Season</label>
                                    <select className="form-control form-control-sm" id="season">
                                        <option value="">All</option>
                                        {seasons.map((season) => (
                                            <option>{season}</option>
                                        ))}
                                    </select>
                                    </div>
                                    <div className="form-group">
                                    <label htmlFor="sort">Sort</label>
                                    <select className="form-control form-control-sm" id="sort">
                                        <option>Starts</option>
                                        <option>Goals</option>
                                    </select>
                                    </div>
                                    <div className="form-group">
                                    <label htmlFor="filter">Filter</label>
                                    <select className="form-control form-control-sm" id="filter">
                                        <option></option>
                                        <option value="OnlyOneApp">One Game Only</option>
                                        <option value="GK">Goalkeepers</option>
                                        <option value="FB">Full Backs</option>
                                        <option value="CD">Central Defenders</option>
                                        <option value="CM">Central Midfielders</option>
                                        <option value="WIN">Wingers</option>
                                        <option value="STR">Strikers</option>
                                    </select>
                                    </div>
                                    <button type="button" className="btn btn-sm btn-primary btn-rounded btn-player-search">Search</button>
                                </form>    
                            </div>

                        </aside>
                        <article className="col-md-9 content-body tranmere-results">
                        <div id="loading">
                            <div className="spinner-grow text-primary" role="status">
                            <span className="sr-only">Loading...</span>
                            </div>
                        </div>
                        <div id="player-search">

                            <meta name="players-ssr-id" content="true" />

                            <table className="table" itemScope itemType ="https://schema.org/SportsTeam">
                                <meta itemProp="name" content="Tranmere Rovers" />
                                <thead className="thead-dark">
                                    <tr>
                                        <th scope="col">Name</th>
                                        <th scope="col" className="text-center">Starts</th>
                                        <th scope="col" className="text-center">Goals</th>
                                        <th scope="col" className="text-center d-none d-sm-table-cell">Assists</th>
                                        <th scope="col" className="text-center">Pic</th>
                                    </tr>
                                </thead>
                                <tbody>
                                {{#players}}
                                <tr itemProp="member" itemScope itemType="https://schema.org/athlete" scope="row">
                                    <td>
                                        <a href="/page/player/{{Player}}" itemprop="name">{{Player}}</a>
                                    </td>
                                    <td className="text-center">{{starts}} {{#subs}}({{subs}}){{/subs}}</td>
                                    <td className="text-center">{{goals}}</td>
                                    <td className="d-none d-sm-table-cell text-center">{{assists}}</td>
                                    <td className="text-center">{{#bio.picLink}}<img width="75px" src="{{bio.picLink}}"/>{{/bio.picLink}}</td>
                                </tr>
                                {{/players}}
                                </tbody>
                            </table>


                        </div>
                        </article>

                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}
