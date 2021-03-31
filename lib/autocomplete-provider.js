'use babel';
/* @flow */

import {filter, score} from 'fuzzaldrin';
import fs from 'fs';
import path from 'path';
import {Range, Point} from 'atom';

// Load in data from rameshvarun/love-ide-data.
const DATA_FOLDER = path.join(__dirname, '..', 'data')
export var API = JSON.parse(fs.readFileSync(path.join(DATA_FOLDER, 'api.json')).toString());
export var CONFIG_API = JSON.parse(fs.readFileSync(path.join(DATA_FOLDER, 'config-api.json')).toString());

var keys = Object.keys(API);
var config_keys = Object.keys(CONFIG_API);

export var provider: AutocompleteProvider = {
	selector: '.source.lua',
	disableForSelector: '.source.lua .comment',

	async getSuggestions(request: SuggestionRequest): Promise<Array<AutocompleteSuggestion>> {
		var prefix = getPrefix(request.editor, request.bufferPosition);
		if (prefix.length === 0) return [];

		if (request.editor.getTitle() === 'conf.lua') {
			return filter(config_keys, prefix).map(name => {
				var completion = CONFIG_API[name];

				var suggestion: AutocompleteSuggestion = {
					displayText: name,
					description: completion.description,
					descriptionMoreURL: completion.url,
					type: 'property',
					rightLabel: completion.default,
					leftLabel: completion.type,
					replacementPrefix: prefix,
				};
				suggestion.snippet = `${name} = \${1:${completion.default}}`;

				return suggestion;
			});
		} else {
			return filter(keys, prefix).filter(name => score(name, prefix) > 0.1).map(name => {
				var completion = API[name];
				var suggestion: AutocompleteSuggestion = {
					displayText: name,
					description: completion.description,
					descriptionMoreURL: completion.url,
					type: completion.type,
					replacementPrefix: prefix
				};

				if (completion.snippet) {
					suggestion.snippet = completion.snippet;
				} else {
					suggestion.text = name;
				}

				return suggestion;
			});
		}
	},
};

function getPrefix(editor: atom$TextEditor, bufferPosition: atom$Point): string {
  var regex = /[a-zA-Z0-9][a-zA-Z0-9_\.]*$/;
	var line = editor.getTextInBufferRange(new Range(
		new Point(bufferPosition.row, 0), bufferPosition));

	var match = line.match(regex);
	if (match) return match[0];
	else return '';
};
