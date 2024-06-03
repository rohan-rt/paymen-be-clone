// Import configs
import config from 'config';

export function getAvatarName(userId: string) {
    return `${config.keys.B2.usersFolder}/${userId}/${config.keys.B2.avatarName}`;
}

export function getLogoName(teamId: string) {
    return `${config.keys.B2.teamsFolder}/${teamId}/${config.keys.B2.logoName}`;
}

export function clearPrefixB64(base64) {
    const rgx = /^data:image\/[a-z]+;base64,/;
    return base64.replace(rgx, '');
}

export function randomColorGenerator() {
    const colors = [
        'red',
        'pink',
        'purple',
        'indigo',
        'blue',
        'cyan',
        'teal',
        'green',
        'amber',
        'orange',
        'brown',
    ];
    const randomNum = Math.floor(Math.random() * colors.length);
    return colors[randomNum];
}
