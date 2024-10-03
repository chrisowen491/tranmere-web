export function translatePlayerName(input: string): string {
  const regex = /\s*\(s\/o\s\d+\)\s*/g;
  input = input.replace(regex, '');
  const mapping = {
    'Rob Apter': 'Robert Apter',
    'Christopher Merrie': 'Chris Merrie',
    'Joshua Williams': 'Josh Williams',
    'Thomas Davies': 'Tom Davies',
    'Joshua Davison': 'Josh Davison',
    'Bradley Walker': 'Brad Walker'
    'Joseph Murphy': 'Joe Murphy'
  };
  return mapping[input.trim()] ? mapping[input.trim()] : input.trim();
}

export function translateTeamName(input: string): string {
  const lookup = input ? input.trim() : '';
  const mapping = {
    'Stevenage Borough': 'Stevege Borough',
    Stevenage: 'Stevege Borough'
  };
  return mapping[lookup] ? mapping[lookup] : lookup;
}

export function translateCompetition(comp: string): string {
  let newComp = comp;
  if (comp.indexOf('EFL Cup') >= 0) {
    newComp = 'League Cup';
  } else if (comp.indexOf('League Cup') >= 0) {
    newComp = 'League Cup';
  } else if (comp.indexOf('FA Cup') >= 0) {
    newComp = 'FA Cup';
  } else if (comp.indexOf('League One') >= 0) {
    newComp = 'League';
  } else if (comp.indexOf('League 1') >= 0) {
    newComp = 'League';
  } else if (comp.indexOf('League Two') >= 0) {
    newComp = 'League';
  } else if (comp.indexOf('League 2') >= 0) {
    newComp = 'League';
  } else if (comp.indexOf('Football League Trophy') >= 0) {
    newComp = 'FL Trophy';
  } else if (comp.indexOf('National League') >= 0) {
    newComp = 'Conference';
  } else if (comp.indexOf('Play') >= 0) {
    newComp = 'Play Offs';
  } else if (comp.indexOf('FA Trophy') >= 0) {
    newComp = 'FA Trophy';
  } else if (comp.indexOf('Football League Div 1') >= 0) {
    newComp = 'League';
  } else if (comp.indexOf('Football League Div 2') >= 0) {
    newComp = 'League';
  } else if (comp.indexOf('Capital One Cup') >= 0) {
    newComp = 'League Cup';
  } else if (comp.indexOf('Carling Cup') >= 0) {
    newComp = 'League Cup';
  } else if (comp.indexOf('JP Trophy') >= 0) {
    newComp = 'FL Trophy';
  } else if (comp.indexOf('EFL Trophy') >= 0) {
    newComp = 'FL Trophy';
  }
  return newComp;
}
