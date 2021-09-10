"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
var vscode = require("vscode");
function activate(context) {
    // 👍 formatter implemented using API
    vscode.languages.registerDocumentFormattingEditProvider("mojangson", {
        provideDocumentFormattingEdits: function (document) {
            var edits = [];
            var indentation = 0;
            var _loop_1 = function (lineNum) {
                var currentLine = document.lineAt(lineNum);
                //remove empty lines
                if (currentLine.isEmptyOrWhitespace && indentation > 0) {
                    edits.push(vscode.TextEdit.delete(currentLine.rangeIncludingLineBreak));
                    return "continue";
                }
                //handle case of an unindented line/fix indenting for a line
                var emptyspace = new vscode.Range(currentLine.range.start, new vscode.Position(currentLine.lineNumber, currentLine.firstNonWhitespaceCharacterIndex));
                edits.push(vscode.TextEdit.replace(emptyspace, "	".repeat(indentation)));
                var indent_matches = __spreadArray([], __read(currentLine.text.matchAll(/([\[\{,])([\s 	]*)/g)), false);
                if (indent_matches.length) {
                    indent_matches.forEach(function (value) {
                        var currentEnd = currentLine.range.end;
                        var testingEnd = new vscode.Position(currentLine.lineNumber, value.index + value[0].length);
                        var isEnd = currentEnd.isEqual(testingEnd);
                        var rangeOfSpace = new vscode.Range(new vscode.Position(currentLine.lineNumber, value.index + 1), testingEnd);
                        if (value[1] !== ",")
                            indentation++;
                        if (isEnd) {
                            edits.push(vscode.TextEdit.delete(rangeOfSpace));
                        }
                        else {
                            edits.push(vscode.TextEdit.replace(rangeOfSpace, (document.eol === 1 ? "\n" : "\r\n") +
                                "	".repeat(indentation)));
                        }
                    });
                }
                var undent_matches = __spreadArray([], __read(currentLine.text.matchAll(/([\]\}])([\s 	]*)/g)), false);
                undent_matches.forEach(function (value) {
                    var currentEnd = currentLine.range.end;
                    var testingEnd = new vscode.Position(currentLine.lineNumber, value.index + value[0].length);
                    var isEnd = currentEnd.isEqual(testingEnd);
                    var rangeToReplace = new vscode.Range(new vscode.Position(currentLine.lineNumber, value.index), testingEnd);
                    indentation--;
                    if (isEnd) {
                        edits.push(vscode.TextEdit.delete(new vscode.Range(new vscode.Position(currentLine.lineNumber, value.index + 1), testingEnd)));
                    }
                    else {
                        edits.push(vscode.TextEdit.replace(rangeToReplace, "\n" + "	".repeat(indentation) + value[0][0]));
                    }
                });
            };
            for (var lineNum = 0; lineNum <= document.lineCount - 1; lineNum++) {
                _loop_1(lineNum);
            }
            //gotta iterate over the position, translating the position
            //vscode.TextEdit.insert(firstLine.range.start, "\n")
            /* for (let i = 0; i < 1; i++) {
                //if (!/[\[\]\{\},]/.test(documentText[i])) continue;
                const pos = document.positionAt(i);
                const space = document.getWordRangeAtPosition(
                    pos,
                    /[\,\{\[\]\}][\s\n]+/,
                );

                const indentChars = ["{", "["];
                const unIndentChars = ["}", "]"];

                if (
                    indentChars.includes(
                        document.lineAt(pos.line).text[pos.character],
                    )
                ) {
                    indentation++;

                    const text = document.getText(
                        new vscode.Range(
                            pos.translate(0, 1),
                            document.lineAt(document.lineCount - 1).range.end,
                        ),
                    );
                    const next = text.match(/^[\s\n\r]);
                    const distance = next[0].length;
                    //just need to get the position
                    edits.push(
                        vscode.TextEdit.replace(
                            new vscode.Range(
                                pos.translate(0, 1),
                                pos.translate(0, distance),
                            ),
                            "\n" + "	".repeat(indentation),
                        ),
                    );
                }
                if (
                    document.lineAt(pos.line).text.slice(pos.character) === ","
                ) {
                    edits.push(
                        vscode.TextEdit.insert(
                            pos.translate(0, 1),
                            "\n" + "	".repeat(indentation),
                        ),
                    );
                }
                if (
                    unIndentChars.includes(
                        document.lineAt(pos.line).text[pos.character],
                    )
                ) {
                    indentation--;
                    edits.push(
                        vscode.TextEdit.insert(
                            pos,
                            "\n" + "	".repeat(indentation),
                        ),
                    );
                }
            }
             */
            return edits;
        },
    });
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map