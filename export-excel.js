XLSX = require('xlsx');

var sheets = ['1984','1985','1986','1987','1988','1989','1990', '1991','1992', '1993', '1994', '1995'];
var sheets2 = [1996,1997,1998,1999,2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019];

function exportme(year) {
    const workBook = XLSX.readFile("./data/apps-master/"+year+".xlsx");

    for(var i=1; i <12; i++) {
        XLSX.writeFile(workBook, './tmp/apps/'+year+'/'+i+'.csv', { bookType: "csv", sheet: i.toString() });
    }
    XLSX.writeFile(workBook, './tmp/goals/'+year+'.csv', { bookType: "csv", sheet: 'goals' });
}

function exportmescraped(year) {
    const workBook = XLSX.readFile("./data/apps-master/"+year+".xlsx");
    XLSX.writeFile(workBook, './tmp/apps/scraped/'+year+'.csv', { bookType: "csv", sheet: 'apps' });
    XLSX.writeFile(workBook, './tmp/goals/'+year+'.csv', { bookType: "csv", sheet: 'goals' });
}

for(var i=0; i < sheets.length; i++) {
    exportme(sheets[i]);
}
for(var i=0; i < sheets2.length; i++) {
    exportmescraped(sheets2[i]);
}

const workBook = XLSX.readFile("./data/apps-master/AllTranmereResults.xlsx");
XLSX.writeFile(workBook, './tmp/games/the_games.csv', { bookType: "csv", sheet: 'AllTranmereResults' });

const masterBook = XLSX.readFile("./data/master.xlsx");
XLSX.writeFile(masterBook, './tmp/stars/stars.csv', { bookType: "csv", sheet: 'stars' });
XLSX.writeFile(masterBook, './tmp/programmes/programmes.csv', { bookType: "csv", sheet: 'programmes' });
XLSX.writeFile(masterBook, './tmp/managers/managers.csv', { bookType: "csv", sheet: 'managers' });
XLSX.writeFile(masterBook, './tmp/links/links.csv', { bookType: "csv", sheet: 'links' });
XLSX.writeFile(masterBook, './tmp/transfers/transfers.csv', { bookType: "csv", sheet: 'transfers' });
XLSX.writeFile(masterBook, './tmp/clubs/clubs.csv', { bookType: "csv", sheet: 'clubs' });
XLSX.writeFile(masterBook, './tmp/players/players.csv', { bookType: "csv", sheet: 'players' });
XLSX.writeFile(masterBook, './tmp/media/media.csv', { bookType: "csv", sheet: 'media' });
XLSX.writeFile(masterBook, './tmp/tickets/tickets.csv', { bookType: "csv", sheet: 'tickets' });


