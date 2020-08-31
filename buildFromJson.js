XLSX = require('xlsx');
const fs = require('fs');


var years = [1996,1997,1998,1999,2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2019];

for(var i=0; i < years.length; i++) {
    var rawdata = fs.readFileSync('data/apps-json/'+years[i]+'.json');
    var data = JSON.parse(rawdata);

    var apps = [];
    var goals = [];

    for(var x=0; x < data.length; x++) {
        apps = apps.concat(data[x].apps.apps);
        goals = goals.concat(data[x].apps.goals);
    }


    var wb = XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(apps, {header: ["Date","Opposition","Competition","Season","Name","Number","SubbedBy","SubTime","YellowCard","RedCard","SubYellow","SubRed"]}), "apps");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(goals), "goals");

    XLSX.writeFile(wb, './data/apps-master/'+years[i]+'.xlsx');

}