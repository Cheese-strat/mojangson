"use strict";

import { start } from "repl";
import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
	// 👍 formatter implemented using API
	vscode.languages.registerDocumentFormattingEditProvider("mojangson", {
		provideDocumentFormattingEdits(
			document: vscode.TextDocument,
		): vscode.TextEdit[] {
			let edits: vscode.TextEdit[] = [];
			let indentation = 0;

			for (let lineNum = 0; lineNum < document.lineCount - 1; lineNum++) {
				const currentLine = document.lineAt(lineNum);

				//remove empty lines
				if (currentLine.isEmptyOrWhitespace && indentation > 0) {
					edits.push(
						vscode.TextEdit.delete(
							currentLine.rangeIncludingLineBreak,
						),
					);
					continue;
				}

				//handle case of an unindented line/fix indenting for a line
				const emptyspace = new vscode.Range(
					currentLine.range.start,
					new vscode.Position(
						currentLine.lineNumber,
						currentLine.firstNonWhitespaceCharacterIndex,
					),
				);
				edits.push(
					vscode.TextEdit.replace(emptyspace, "	".repeat(indentation)),
				);

				const indent_matches = [
					...currentLine.text.matchAll(/([\[\{,])([\s 	]*)/g),
				];
				if (indent_matches.length) {
					indent_matches.forEach(value => {
						const currentEnd = currentLine.range.end;
						const testingEnd = new vscode.Position(
							currentLine.lineNumber,
							value.index + value[0].length,
						);
						const isEnd = currentEnd.isEqual(testingEnd);

						const rangeOfSpace = new vscode.Range(
							new vscode.Position(
								currentLine.lineNumber,
								value.index + 1,
							),
							testingEnd,
						);
						if (value[1] !== ",") indentation++;
						if (isEnd) {
							edits.push(vscode.TextEdit.delete(rangeOfSpace));
						} else {
							edits.push(
								vscode.TextEdit.replace(
									rangeOfSpace,
									(document.eol === 1 ? "\n" : "\r\n") +
										"	".repeat(indentation),
								),
							);
						}
					});
				}
				const undent_matches = [
					...currentLine.text.matchAll(/([\]\}])([\s 	]*)/g),
				];
				undent_matches.forEach(value => {
					const currentEnd = currentLine.range.end;
					const testingEnd = new vscode.Position(
						currentLine.lineNumber,
						value.index + value[0].length,
					);
					const isEnd = currentEnd.isEqual(testingEnd);

					const rangeToReplace = new vscode.Range(
						new vscode.Position(
							currentLine.lineNumber,
							value.index,
						),
						testingEnd,
					);
					indentation--;
					if (isEnd) {
						edits.push(
							vscode.TextEdit.delete(
								new vscode.Range(
									new vscode.Position(
										currentLine.lineNumber,
										value.index + 1,
									),
									testingEnd,
								),
							),
						);
					} else {
						edits.push(
							vscode.TextEdit.replace(
								rangeToReplace,
								`\n` + "	".repeat(indentation) + value[0][0],
								/*(document.eol === 1 ? "\n" : "\r\n") +
									"	".repeat(indentation) +
									value[0][0],*/
							),
						);
					}
				});
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
