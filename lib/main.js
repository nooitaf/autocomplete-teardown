'use babel';

export function getAutoCompleteProvider(): AutocompleteProvider {
	return require('./autocomplete-provider').provider;
}
