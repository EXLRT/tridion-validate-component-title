Type.registerNamespace("Extensions.ValidateTitleField");

Extensions.ValidateTitleFieldCommand = function ValidateTitleFieldCommand() {
    Type.enableInterface(this, "Extensions.ValidateTitleFieldCommand");
    this.addInterface("Tridion.Cme.Command", ["ValidateTitleFieldCommand"]);
}

/**
 * Regular Expression that covers a very small range of unicode, but excludes / \ . 
 * See {@link https://unicode-table.com/en/blocks/basic-latin/} for details.
 * @constant
 */
Extensions.ValidateTitleFieldCommand.prototype._whitelistRegExp = new RegExp(/^[\u0020-\u002e\u0030-\u005b\u005d-\u007f]*$/);


/**
 * Helper. Tests if a string contains diacritics
 * @param {string} string 
 * @returns {boolean}
 */
Extensions.ValidateTitleFieldCommand.prototype._hasDiacritics = function ValidateTitleFieldCommand$_hasDiacritics(string) {
    var result = false;

    if (string) {
        result = !this._whitelistRegExp.test(string);
    }

    return result;
}


/**
 * Helper. Finds diacritics in a string
 * @param {string} string
 * @returns {string[]} an array of 1-letter strings which are each a "diacritic" or out-of-bound character
 */
Extensions.ValidateTitleFieldCommand.prototype._findDiacritics = function ValidateTitleFieldCommand$_findDiacritics(string) {
    var diacritics = [];

    if (this._hasDiacritics(string)) {
        var stringArray = string.split('');
        var _this = this;
        diacritics = stringArray.filter(function (char) {
            return _this._hasDiacritics(char);
        });
    }
    return diacritics;
}


/**
 * Helper. Removes diacritics from string
 * See {@link https://stackoverflow.com/a/37511463/1045901} for details about the normalize approach
 * @param {string} string the string which needs diacritics removed
 * @param {string[]} [blacklistChars] array of strings to remove
 * @returns {string}
 */
Extensions.ValidateTitleFieldCommand.prototype._normalizeString = function ValidateTitleFieldCommand$_normalizeString(string, blacklistChars) {
    var outOfRangeChars = blacklistChars || [];
    return string
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(outOfRangeChars.join(''), '');
}


/**
 * Extracts the title from a Component
 * @param {object} item  and item retrieved with $display.getItem()
 * @returns {string|undefined} if the item is a component, it returns the title
 */
Extensions.ValidateTitleFieldCommand.prototype.getComponentTitle = function ValidateTitleFieldCommand$GetComponentTitle(item) {
    var title;
    if (item) {
        if (item.getItemTypeName() === "Component") {
            title = item.properties.title;
        }
    }

    return title;
}


// Don't Delete. GUI Extension has to come available
Extensions.ValidateTitleFieldCommand.prototype._isAvailable = function ValidateTitleFieldCommand$_isAvailable(selection) {
    return $cme.getCommand("Save")._isAvailable(selection);
};

// Don't Delete. GUI extension must be enabled
Extensions.ValidateTitleFieldCommand.prototype._isEnabled = function ValidateTitleFieldCommand$_isEnabled(selection) {
    return $cme.getCommand("Save")._isEnabled(selection);
};


/**
 * @typedef {Object} Message
 * @property {string} messageTitle The short title of the message to display
 * @property {string} messageBody The longer description of the message
 * @property {string} messageDetail Detailed explanation of message that user only sees when clicking for more info
 */

/**
 * Generates an error message object
 * @param {string} title 
 * @returns {Message} error message object
 */
Extensions.ValidateTitleFieldCommand.prototype.generateMessage = function ValidateTitleFieldCommand$generateMessage(title) {
    var diacriticMatches = this._findDiacritics(title);
    var stringifiedMatches = diacriticMatches.join(',');
    var normalizedTitle = this._normalizeString(title, diacriticMatches);

    var messageTitle = 'Invalid Component Title';
    var hasMultipleMatches = diacriticMatches.length > 1;
    var messageBodyPlural = hasMultipleMatches ?  ' invalid characters.' : ' an invalid character.';
    var messageBody = "The name of the component contains" + messageBodyPlural + '  Remove or change ' + stringifiedMatches + ' and try saving again.';
    var messageDetail = 'The characters ' + stringifiedMatches + ' are not allowed. \nTry changing "'+ title  +'" to "' + normalizedTitle + '". \nCharacters must match the expression ' + this._whitelistRegExp.toString() + ' .'; 

    return {
        messageTitle: messageTitle,
        messageBody: messageBody,
        messageDetail: messageDetail 
    };
}

// Save Command
Extensions.ValidateTitleFieldCommand.prototype._execute = function ValidateTitleFieldCommand$_execute(selection, pipeline) {
    var title = this.getComponentTitle($display.getItem());
    var hasDiacritics = title && this._hasDiacritics(title);

    if (hasDiacritics) {
        var errorMessage = this.generateMessage(title);

        Tridion.MessageCenter.registerError(
            errorMessage.messageTitle,
            errorMessage.messageBody,
            errorMessage.messageDetail
        );
    } else {
        return $cme.getCommand("Save")._execute(selection, pipeline);
    }
};