module.exports = {
    meta: {
        type: 'problem',
        docs: {
            description: "Запрещает использование 'import type' для классов, используемых в DI",
            recommended: true
        },
        fixable: 'code',
        schema: [],
        messages: {
            noTypeImportForDI: "Используйте обычный импорт вместо 'import type' для классов, участвующих в DI."
        }
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
                                    const importNode = typeImports.get(typeName);
                                    context.report({
                                        node: importNode,
                                        messageId: 'noTypeImportForDI',
                                        fix(fixer) {
                                            const importToken = context.sourceCode.getFirstToken(importNode);
                                            return fixer.replaceText(importToken, 'import');
                                        }
                                    });
                                }
                            }
                        }
                    });
                }
            }
        };
    }
};
