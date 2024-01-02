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