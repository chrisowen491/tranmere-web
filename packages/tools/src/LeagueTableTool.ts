import { tool } from 'ai';
import { z } from 'zod';
import fetch from 'node-fetch';
import { STANDARD_HEADERS } from '@tranmere-web/lib/src/apiFunctions';
import {
  TranmereWebUtils,
} from '@tranmere-web/lib/src/tranmere-web-utils';

const utils = new TranmereWebUtils();

export const LeagueTableTool = tool({
  description: 'Get current league table standings for Tranmere Rovers.',
  inputSchema: z.object({}),
  execute: async () => {
    const teamID = 't44';
    const seasonID = utils.getYear();
    const fixtureUrl = `https://league-tables.football.web.gc.tranmereroversfcservices.co.uk/v1/opta?competitionID=12&teamID=${teamID}&positions=50&seasonID=${seasonID}`;
    const fixturesResponse = await fetch(fixtureUrl, STANDARD_HEADERS);
    const tableData = (await fixturesResponse.json()) as TableResponse;

    const table = tableData.body.leagueTable.teamStandings.map((team) => {
      return {
        position: team.position,
        teamName: team.teamName,
        played: team.played,
        won: team.won,
        drawn: team.drawn,
        lost: team.lost,
        goalsFor: team.goalsFor,
        goalsAgainst: team.goalsAgainst,
        goalDifference: team.goalsFor - team.goalsAgainst,
        points: team.points
      };
    });

    return JSON.stringify(table);
  }
});

interface TableResponse {
  success: boolean;
  message: string;
  imageHandlerURL: string;
  body: Body;
}

interface Body {
  roundNumber: string;
  importUTCDateTime: string;
  leagueTable: LeagueTable;
  competitionID: number;
  importUTCTimestamp: number;
  competitionCode: string;
  competitionIcons: CompetitionIcons;
  competitionName: string;
  seasonID: number;
  seasonName: string;
}

interface LeagueTable {
  teamStandings: TeamStanding[];
  matchDay: string;
}

interface TeamStanding {
  homeDrawn: number;
  homePlayed: number;
  homeFor: number;
  awayPlayed: number;
  awayPosition: number;
  points: number;
  startDayPosition: number;
  awayWon: number;
  homeWon: number;
  lost: number;
  teamID: string;
  won: number;
  awayDrawn: number;
  awayLost: number;
  homeAgainst: number;
  awayAgainst: number;
  goalsAgainst: number;
  drawn: number;
  homeLost: number;
  awayFor: number;
  awayPoints: number;
  homePoints: number;
  played: number;
  homePosition: number;
  goalsFor: number;
  form: string[];
  position: number;
  teamName: string;
  shortTeamName: string;
  teamNameInitials: string;
  country: string;
  teamCrest: string;
  teamCrests: TeamCrests;
  lineAfterData: boolean;
}

interface TeamCrests {
  crestDefaultMediaLibraryID: string;
  crestDefaultKey: string;
}

interface CompetitionIcons {
  'pill-full-colour': string;
  'crest-full-colour': string;
  'crest-white-outline': string;
  'pill-black-colour': string;
  'crest-black-outline': string;
  'pill-white-colour': string;
  'wide-full-colour': string;
}
