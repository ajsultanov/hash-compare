const compare = require('./hashCompare');

describe('arguments tests', () => {
    test('throws error on lack of two arguments', () => {
        expect(() => {
            compare({a: 1}) 
        }).toThrow(new TypeError('Two arguments are required'));
    });

    test('throws error on arguments are not both hashes', () => {
        expect(() => {
            compare(1, 2)
        }).toThrow(new TypeError('Two hashes are required'));
        expect(() => {
            compare({a: 1}, 2)
        }).toThrow(new TypeError('Two hashes are required'));
        expect(() => {
            compare(1, {b: 2})
        }).toThrow(new TypeError('Two hashes are required'));
    });

    test('throws error on invalid options argument', () => {
        expect(() => {
            compare({a: 1}, {a: 1}, 'a')
        }).toThrow();
        expect(() => {
            compare({a: 1}, {a: 1}, {isDeepComparison: 'a'})
        }).toThrow();
        expect(() => {
            compare({a: 1}, {a: 1}, {isShallowComparison: true})
        }).toThrow();
        expect(() => {
            compare({a: 1}, {a: 1}, {isShallowComparison: true, anotherOption: true})
        }).toThrow();
    })

    test('accepts valid options object or no options object', () => {
        expect(() => {
            compare({a: 1}, {a: 1})
        }).not.toThrow();
        expect(() => {
            compare({a: 1}, {a: 1}, {})
        }).not.toThrow();
        expect(() => {
            compare({a: 1}, {a: 1}, {isDeepComparison: false})
        }).not.toThrow()
        expect(() => {
            compare({a: 1}, {a: 1}, {isDeepComparison: true})
        }).not.toThrow()
    })
});

describe('shallow comparison tests', () => {
    const options = {isDeepComparison: false};

    test('returns empty diff object on equality', () => {
        expect(compare({}, {}, options)).toEqual({added:{}, missing:{}, updated:{}});
        expect(compare({a: 1}, {a: 1}, options)).toEqual({added:{}, missing:{}, updated:{}});
        expect(compare(
            {a: 'string', b: 2, c: true},
            {a: 'string', b: 2, c: true},
            options
        )).toEqual({added:{}, missing:{}, updated:{}});
    });

    test('logs added items', () => {
        expect(compare({a: 1}, {a: 1, b: 2}, options)).toHaveProperty('added', {b: 2});
    })

    test('logs missing items', () => {
        expect(compare({a: 1, b: 2}, {b: 2}, options)).toHaveProperty('missing', {a: 1});
    })

    test('logs updated items', () => {
        expect(compare({a: 1}, {a: 2}, options)).toHaveProperty('updated', {a: '1 -> 2'});
    })

    test('logs identical hashes as updates', () => {
        expect(compare(
            {a: {b: 1}}, 
            {a: {b: 1}}, 
            options
        )).toHaveProperty('updated', {a: '[object Object] -> [object Object]'});
    })

    test('logs identical arrays as updates', () => {
        expect(compare(
            {a: [1, 2]}, 
            {a: [1, 2]}, 
            options
        )).toHaveProperty('updated', {a: '1,2 -> 1,2'});
    })
})

describe('basic comparison tests', () => {
    test('returns empty diff object on equality', () => {
        expect(compare({}, {})).toEqual({added:{}, missing:{}, updated:{}});
        expect(compare({a: 1}, {a: 1})).toEqual({added:{}, missing:{}, updated:{}});
        expect(compare(
            {a: 'string', b: 2, c: true},
            {a: 'string', b: 2, c: true}
        )).toEqual({added:{}, missing:{}, updated:{}});
        expect(compare(
            {a: 'string', b: 2, c: true, d: [3], e: {f: 4}},
            {a: 'string', b: 2, c: true, d: [3], e: {f: 4}}
        )).toEqual({added:{}, missing:{}, updated:{}});
    });

    test('logs added items', () => {
        expect(compare({a: 1}, {a: 1, b: 2})).toHaveProperty('added', {b: 2});
    })

    test('logs missing items', () => {
        expect(compare({a: 1, b: 2}, {b: 2})).toHaveProperty('missing', {a: 1});
    })

    test('logs updated items', () => {
        expect(compare({a: 1}, {a: 2})).toHaveProperty('updated', {a: '1 -> 2'});
    })

    test('logs mismatched types with their respective types', () => {
        expect(compare({a: 1}, {a: '1'})).toHaveProperty('updated', {a: '1 (Number) -> 1 (String)'}); 
        expect(compare({a: 1}, {a: [1]})).toHaveProperty('updated', {a: '1 (Number) -> 1 (Array)'});   
        expect(compare({a: true}, {a: 'true'})).toHaveProperty('updated', {a: 'true (Boolean) -> true (String)'}); 
        expect(compare({a: ['b']}, {a: {b: 1}})).toHaveProperty('updated', {a: 'b (Array) -> [object Object] (Object)'}); 
    })
});

describe('nested comparison tests', () => {
    test('logs nested hash additions', () => {
        expect(compare(
            {a: {b: 1}}, 
            {a: {b: 1, c: 2}}
        )).toHaveProperty('added', {'a.c': 2});
    })

    test('logs nested hash subtractions', () => {
        expect(compare(
            {a: {b: 1, c: 2}}, 
            {a: {b: 1}}
        )).toHaveProperty('missing', {'a.c': 2});
    })

    test('logs nested hash updates', () => {
        expect(compare(
            {a: {b: 1, c: 2}}, 
            {a: {b: 1, c: 3}}
        )).toHaveProperty('updated', {'a.c': '2 -> 3'});
    })

    test('logs nested array additions', () => {
        expect(compare(
            {a: [1, [2]]}, 
            {a: [1, [2, 3]]}
        )).toHaveProperty('added', {'a[1][1]': 3});
    })

    test('logs nested array subtractions', () => {
        expect(compare(
            {a: [1, [2, 3]]}, 
            {a: [1, [2]]}
        )).toHaveProperty('missing', {'a[1][1]': 3});
    })

    test('logs nested array updates', () => {
        expect(compare(
            {a: [1, [2]]}, 
            {a: [1, [3]]}
        )).toHaveProperty('updated', {'a[1][0]': '2 -> 3'});
    })

    test('logs complex nested comparisons', () => {
        expect(compare(
            {a: {b: 1, c: [2, 3, { d: 4 }]}, e: 5, f: [[6, [7, 8, 9]]]}, 
            {a: {b: 1, c: [2, 3, { d: 4, e: 5 }]}, f: [[6, [7, 8, 10]]]}
        )).toEqual({added:{'a.c[2].e': 5}, missing:{'e': 5}, updated:{'f[0][1][2]': '9 -> 10'}});
    })
});
