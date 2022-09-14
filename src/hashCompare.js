
function hashCompare(hash1, hash2, options = {}) {
    if (!hash1 || !hash2) {
        throw new TypeError('Two arguments are required');
    }

    if (
        Object.prototype.toString.call(hash1) !== '[object Object]' ||
        Object.prototype.toString.call(hash2) !== '[object Object]'
    ) {
        throw new TypeError('Two hashes are required');
    }

    if (Object.keys(options).length > 0) {
        if (typeof options.isDeepComparison !== 'boolean') {
            throw new Error('The provided options object must contain the boolean isDeepComparison');
        }
        if (Object.keys(options).length > 1) {
            throw new Error('The provided options object should only contain the boolean isDeepComparison')
        }
    }

    let diffs = {
        'added': {},
        'missing': {},
        'updated': {}
    };
    
    if (options.isDeepComparison === false) {    
        // shallow compare
        // 1:1 comparison for all keys
        
        for (let key in hash1) {
            if (hash2[key] !== undefined) {
                if (Object.prototype.toString.call(hash1[key]) !== Object.prototype.toString.call(hash2[key])) {
                    const regex = /(\w+)]/
                    const type1 = Object.prototype.toString.call(hash1[key]).match(regex)[1]
                    const type2 = Object.prototype.toString.call(hash2[key]).match(regex)[1]
                    diffs.updated[key] = `${hash1[key]} (${type1}) -> ${hash2[key]} (${type2})`
                }
                else if (hash1[key] !== hash2[key]) {
                    diffs.updated[key] = hash1[key] + ' -> ' + hash2[key];    // returns updated for hashes & arrays
                }
            } else {
                diffs.missing[key] = hash1[key];
            }
        }

        for (let key in hash2) {
            if (hash1[key] === undefined) {
                diffs.added[key] = hash2[key];
            }
        }
        
    } else {
        // deep compare
        // 1:1 comparison for strings, numbers, booleans
        // recursive comparison for arrays and hashes

        function deepCompare(a, b, path) {
            if (typeof a === 'undefined') {
                diffs.added[path] = b
            }
            else if (typeof b === 'undefined') {
                diffs.missing[path] = a
            }

            else if (Object.prototype.toString.call(a) !== Object.prototype.toString.call(b)) {
                const regex = /(\w+)]/
                const type1 = Object.prototype.toString.call(a).match(regex)[1]
                const type2 = Object.prototype.toString.call(b).match(regex)[1]
                diffs.updated[path] = `${a} (${type1}) -> ${b} (${type2})`
            }

            else if (
                (typeof a === 'number' ||
                typeof a === 'string' ||
                typeof a === 'boolean') &&
                a !== b
            ) {
                diffs.updated[path] = a + ' -> ' + b
            }

            else if (
                Object.prototype.toString.call(a) === '[object Object]' &&
                Object.prototype.toString.call(b) === '[object Object]'
            ) {
                for (const key in a) {
                    deepCompare(a[key], b[key], path ? path + '.' + key : key);
                }
                for (const key in b) {
                    deepCompare(a[key], b[key], path ? path + '.' + key : key);
                }
            }

            else if (Array.isArray(a) && Array.isArray(b)) {
                for (let i = 0; i < a.length; i++) {
                    deepCompare(a[i], b[i], path ? path + '[' + i + ']' : i)
                }
                for (let i = 0; i < b.length; i++) {
                    deepCompare(a[i], b[i], path ? path + '[' + i + ']' : i)
                }
            }
        }
        deepCompare(hash1, hash2, '')
    }
    return diffs
}

module.exports = hashCompare;