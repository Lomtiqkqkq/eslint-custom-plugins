export default {
    meta: {
        type: "problem",
        docs: {
            description: "Ignore @typescript-eslint/consistent-type-imports for NestJS DI",
            recommended: false
        },
        schema: [],
        messages: {
            typeOnlyImportUsedInConstructor: "Type-only import is used in constructor for DI, consider removing the 'type' keyword."
        },
        fixable: "code"
    },

    create(context) {
        const typeImports = new Map(); // { ImportedName => node }

        return {
            ImportDeclaration(node) {
                if (node.importKind === "type") {
                    for (const spec of node.specifiers) {
                        if (spec.type === "ImportSpecifier") {
                            typeImports.set(spec.local.name, node);
                        }
                    }
                }
            },

            MethodDefinition(node) {
                if (
                    node.kind === "constructor" &&
                    node.value?.params?.length &&
                    node.value.params.every((param) => param.type === "TSParameterProperty")
                ) {
                    for (const param of node.value.params) {
                        const identifier = param.parameter.name;
                        if (typeImports.has(identifier)) {
                            const importNode = typeImports.get(identifier);
                            context.report({
                                node: importNode,
                                messageId: "typeOnlyImportUsedInConstructor",
                                fix(fixer) {
                                    // remove the 'type' keyword from import
                                    const importStart = importNode.range[0];
                                    const importText = context.getSourceCode().getText(importNode);
                                    const fixedText = importText.replace(/^import\s+type/, "import");
                                    return fixer.replaceTextRange([importStart, importStart + importText.length], fixedText);
                                }
                            });
                        }
                    }
                }
            }
        };
    }
};
