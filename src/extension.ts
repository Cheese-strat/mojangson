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

			for (
				let lineNum = 0;
				lineNum <= document.lineCount - 1;
				lineNum++
			) {
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
							),
						);
					}
				});
			}

			return edits;
		},
	});
}
