'use babel';
/* @flow */

import {filter, score} from 'fuzzaldrin';
import fs from 'fs';
import path from 'path';
import {Range, Point} from 'atom';

// Load in data from rameshvarun/love-ide-data.
const DATA_FOLDER = path.join(__dirname, '..', 'data')
export var API = JSON.parse(fs.readFileSync(path.join(DATA_FOLDER, 'api.json')).toString());

// var keys = Object.keys(API);
var keys = []
API.forEach((item, i) => {
  item.functions.forEach((func, i) => {
    let snippet = ""
    if (func.args && func.args.length) {
      snippet += "("
      func.args.forEach((arg, i) => {
        snippet += "${" + (i+1) + ":" + arg.name + "}"
        if (func.args.length-1 !== i) {
          snippet += ","
        }
      });
      snippet += ")"
    }

    
    
    keys[func.name] = {
      description: func.info || "...",
      descriptionMoreURL: "https://teardowngame.com/modding/api.html#" + func.name,
      type: "function",
      snippet: snippet || false,
      text: func.example || func.name
    }
  });
});

// var groups = API;

export var provider: AutocompleteProvider = {
	selector: '.source.lua',
	disableForSelector: '.source.lua .comment',

	async getSuggestions(request: SuggestionRequest): Promise<Array<AutocompleteSuggestion>> {
		var prefix = getPrefix(request.editor, request.bufferPosition);
		if (prefix.length === 0) return [];
		return filter(keys, prefix).filter(name => score(name, prefix) > 0.1).map(name => {
			var completion = keys[name];
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
