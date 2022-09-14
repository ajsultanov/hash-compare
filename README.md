# Hash Compare

- takes two hashes as arguments
- takes optional options object, for a deep or shallow comparison
    - defaults to deep
- returns a difference hash
    - specifies nested hashes with dot notation
    - specifies nested arrays with square bracket notation
    - updated list shows original and changed values

## Run tests

commands:

`npm test`

`npm test -- -t arguments`

`npm test -- -t shallow`

`npm test -- -t basic`

`npm test -- -t nested`