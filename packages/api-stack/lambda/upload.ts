import { v4 as uuidv4 } from 'uuid';
import csv from 'csvtojson';
import {
  TranmereWebUtils,
  DataTables
} from '@tranmere-web/lib/src/tranmere-web-utils';
import { Match } from '@tranmere-web/lib/src/tranmere-web-types';
const utils = new TranmereWebUtils();

interface Match2 extends Match {
  attendanceStr?: string;
}

exports.handler = () => {
  csv()
    .fromFile('./csv/friendlies.csv')
    .on('data', (row) => {
      const item = JSON.parse(row) as Match2;
      item.ft = `${item.hgoal}-${item.vgoal}`;
      item.home =
        item.venue === 'Prenton Park' ? 'Tranmere Rovers' : item.opposition;
      item.visitor =
        item.venue === 'Prenton Park' ? item.opposition : 'Tranmere Rovers';
      item.programme = '#N/A';
      item.competition = 'Friendly';
      item.venue = item.venue ? item.venue : 'Unknown';
      item.attendance = !item.attendanceStr ? 0 : parseInt(item.attendanceStr);
      delete item.attendanceStr;

      item.id = uuidv4();
      utils.insertUpdateItem(item, DataTables.RESULTS_TABLE);
    });

  return 'Data uploaded';
};
