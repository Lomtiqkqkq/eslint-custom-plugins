const { ESLintUtils } = require('@typescript-eslint/utils');

module.exports = {
    meta: {
        type: 'problem',
        docs: {
            description: "Запрещает использование 'import type' для классов, используемых в DI",
            recommended: 'error',
        },
        fixable: 'code',
        schema: [],
        messages: {
            noTypeImportForDI: "Используйте обычный импорт вместо 'import type' для классов, участвующих в DI.",
        },
    },

    create(context) {
        const typeImports = new Map();

        return {
            ImportDeclaration(node) {
                if (node.importKind === 'type') {
                    node.specifiers.forEach((specifier) => {
                        const importedName = specifier.local.name;
                        typeImports.set(importedName, node);
                    });
                }
            },

            MethodDefinition(node) {
                if (node.kind === 'constructor') {
                    node.value.params.forEach((param) => {
                        if (param.type === 'TSParameterProperty') {
                            const typeAnnotation = param.parameter.typeAnnotation;
                            if (
                                typeAnnotation &&
                                typeAnnotation.typeAnnotation.type === 'TSTypeReference'
                            ) {
                                const typeName = typeAnnotation.typeAnnotation.typeName.name;
                                if (typeImports.has(typeName)) {
                                    context.report({
                                        node: typeImports.get(typeName),
                                        messageId: 'noTypeImportForDI',
                                        fix(fixer) {
                                            const importToken = context.sourceCode.getFirstToken(
                                                typeImports.get(typeName)
                                            );
                                            return fixer.replaceText(importToken, 'import');
                                        },
                                    });
                                }
                            }
                        }
                    });
                }
            },
        };
    },
};
