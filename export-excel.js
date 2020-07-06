XLSX = require('xlsx');

var sheets = ['1988', '1991','1992', '1993'];

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

