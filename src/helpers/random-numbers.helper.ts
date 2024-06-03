export function generateRandNum(n: number): string {
    let add = 1,
        max = 12 - add; // 12 is the min safe number Math.random() can generate without it starting to pad the end with zeros.

    if (n > max) {
        return generateRandNum(max) + generateRandNum(n - max);
    }

    max = Math.pow(10, n + add);
    let min = max / 10; // Math.pow(10, n) basically
    let number = Math.floor(Math.random() * (max - min + 1)) + min;

    return ('' + number).substring(add);
}

// n is amount of characters to return
// arr is a string containing allowed characters
export function generateRandomAlphaNum(n: number, arr?: string): string {
    if (!arr) arr = '0123456789abcdefghijklmnopqrstuvwxyz';
    let ans = '';
    for (let i = n; i > 0; i--) {
        ans += arr[Math.floor(Math.random() * arr.length)];
    }
    return ans;
}
