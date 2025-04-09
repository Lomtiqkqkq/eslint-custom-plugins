const noTypeImportDi = require('./rules/no-type-import-di');

module.exports = {
    rules: {
        'no-type-import-di': noTypeImportDi
    },
    configs: {
        recommended: {
            plugins: ['nest-di'],
            rules: {
                'nest-di/no-type-import-di': 'error'
            }
        }
    }
};
