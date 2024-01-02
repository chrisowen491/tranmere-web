export function translatePlayerName(input: string) : string {
    const regex = /\s*\(s\/o\s\d+\)\s*/g;
    input = input.replace(regex, '');
    var mapping = {
        'Rob Apter': 'Robert Apter'
    }
    return mapping[input.trim()] ? mapping[input.trim()] : input.trim();
}

export function translateTeamName(input: string) : string {
    var lookup = input ? input.trim() : "";
    var mapping = {
        'Stevenage Borough': 'Stevege Borough',
        'Stevenage': 'Stevege Borough',
    }
    return mapping[lookup] ? mapping[lookup] : lookup;
}

export function translateCompetition(comp: string) : string {
    if(comp.indexOf('EFL Cup') > 0) {
      comp = "League Cup"
    } else if(comp.indexOf('League Cup') > 0) {
        comp = "League Cup"
    } else if(comp.indexOf('FA Cup') > 0) {
        comp = "FA Cup"
    } else if(comp.indexOf('League One') > 0) {
        comp = "League"
      } else if(comp.indexOf('League 1') > 0) {
        comp = "League"        
    } else if(comp.indexOf('League Two') > 0) {
        comp = "League"
      } else if(comp.indexOf('League 2') > 0) {
        comp = "League"        
    } else if(comp.indexOf('Football League Trophy') > 0) {
        comp = "FL Trophy"
    } else if(comp.indexOf('National League') > 0) {
        comp = "Conference"
    } else if(comp.indexOf('Play') > 0) {
        comp = "Play Offs"
    } else if(comp.indexOf('FA Trophy') > 0) {
        comp = "FA Trophy"
    } else if(comp.indexOf('Football League Div 1') > 0) {
        comp = "League"
    } else if(comp.indexOf('Football League Div 2') > 0) {
        comp = "League"
    } else if(comp.indexOf('Capital One Cup') > 0) {
        comp = "League Cup"
    } else if(comp.indexOf('Carling Cup') > 0) {
        comp = "League Cup"
    } else if(comp.indexOf('JP Trophy') > 0) {
        comp = "FL Trophy"
    } else if(comp.indexOf('EFL Trophy') > 0) {
        comp = "FL Trophy"
    }
    return comp;
}