function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

// returns a random element of the array
function pickFromArray(a) {
    return a[Math.floor(Math.random() * a.length)];
}

// not inclusive
function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

export { clamp, pickFromArray, randomBetween };
