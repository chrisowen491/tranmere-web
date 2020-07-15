XLSX = require('xlsx');

var sheets = ['1984','1985','1986','1987','1988','1989','1990', '1991','1992', '1993', '1994'];

function exportme(year) {
    const workBook = XLSX.readFile("./data/apps-master/"+year+".xlsx");
    for(var i=1; i <12; i++) {
        XLSX.writeFile(workBook, './data/apps/'+year+'/'+i+'.csv', { bookType: "csv", sheet: i.toString() });
    }
    XLSX.writeFile(workBook, './data/goals/'+year+'.csv', { bookType: "csv", sheet: 'goals' });
}

for(var i=0; i < sheets.length; i++) {
    exportme(sheets[i]);
}

const workBook = XLSX.readFile("./data/apps-master/AllTranmereResults.xlsx");
XLSX.writeFile(workBook, './data/games/games.csv', { bookType: "csv", sheet: 'AllTranmereResults' });

const starsBook = XLSX.readFile("./data/stars/stars.xlsx");
XLSX.writeFile(starsBook, './data/stars/stars.csv', { bookType: "csv", sheet: 'stars' });

const programmesBook = XLSX.readFile("./data/programmes/programmes.xlsx");
XLSX.writeFile(programmesBook, './data/programmes/programmes.csv', { bookType: "csv", sheet: 'programmes' });

