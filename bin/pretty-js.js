#!/usr/bin/env node
var fs, OptionParser, options, parser, prettyJs, processFiles, unparsed;

fs = require('fs');
OptionParser = require('option-parser');
prettyJs = require('../');
processFiles = require('process-files');

options = {
    bom: false,
    commentSpace: '  ',
    convertStrings: 'double',
    elseNewline: false,
    indent: '    ',
    inPlace: false,
    jslint: false,
    newline: "\n",
    quoteProperties: false,
    verbose: false
};
parser = new OptionParser();

parser.addOption('b', 'bom', 'Byte-order-mark handling.  "add" will always add one, "remove" removes one if there is any, "preserve" will keep it if it exists.  "remove" is the default.')
    .argument('ACTION')
    .validation(function (value) {
        value = value.toLowerCase();

        if (value !== 'add' && value !== 'remove' && value !== 'preserve') {
            return 'BOM action must be add, remove, or preserve.';
        }
    })
    .action(function (value) {
        switch (value.toLowerCase()) {
        case 'add':
            options.bom = true;
            break;

        case 'preserve':
            options.bom = null;
            break;

        case 'remove':
            options.bom = false;
            break;
        }
    });

parser.addOption('s', 'comment-space', 'Indentation string to add before single-line comments sharing the same line as some code.  Defaults to "  " (two spaces).')
    .argument('STRING')
    .action(function (value) {
        options.commentSpace = value;
    });

parser.addOption('c', 'convert-strings', 'Convert strings to use double or single quotes.  Allowed values are "double", "single" and "preserve".  Defaults to "double".')
    .argument('ACTION')
    .validation(function (value) {
        value = value.toLowerCase();

        if (value !== 'double' && value !== 'single' && value !== 'preserve') {
            return 'Convert strings must be double, single or preserve.';
        }
    })
    .action(function (value) {
        value = value.toLowerCase();
        options.convertStrings = null;

        if (value === 'double' || value === 'single') {
            options.convertStrings = value;
        }
    });

parser.addOption('d', 'debug', 'Enable debugging information')
    .action(function () {
        options.debug = true;
    });

parser.addOption('e', 'else-newline', 'Turn on an extra newline before "else" and "catch".')
    .action(function () {
        options.elseNewline = true;
    });

parser.addOption('h', 'help', 'This help message.')
    .action(parser.helpAction());

parser.addOption('i', 'in-place', 'Write out files on top of originals after pretty printing.')
    .action(function () {
        options.inPlace = true;
    });

parser.addOption('s', 'indent', 'What to use for a single indentation level.  Defaults to four spaces.')
    .argument('STRING')
    .action(function (value) {
        options.indent = value;
    });

parser.addOption('l', 'jslint', 'Turns on jslint-compatible rules.')
    .action(function () {
        options.jslint = true;
    });

parser.addOption('j', 'json', 'Enable JSON-compatible rules.')
    .action(function () {
        options.bom = false;
        options.convertStrings = 'double';
        options.jslint = false;
        options.quoteProperties = true;
    });

parser.addOption('n', 'newline', 'What to use for newlines.  Must be one of "cr", "lf", or "crlf" (case insensitive).  The default is "cr" for just a carriage return.')
    .validation(function (value) {
        if (!value.match(/^(cr|lf|crlf)$/i)) {
            return 'Must use cr, lf or crlf for the newlines';
        }
    })
    .action(function (value) {
        switch (value.toUpperCase()) {
        case 'cr':
            options.newline = '\r';
            break;

        case 'lf':
            options.newline = '\n';
            break;

        case 'crlf':
            options.newline = '\r\n';
            break;
        }
    });

parser.addOption('q', 'quote-properties', 'How should object literals list their properties?  "add" will always add quotes, "remove" removes unnecessary quoting and "preserve" keeps properties as-is.  For JSON you want "add" in order to correct common quoting errors.  Default is "remove".')
    .argument('ACTION')
    .validation(function (value) {
        value = value.toLowerCase();

        if (value !== 'add' && value !== 'remove' && value !== 'preserve') {
            return 'The quoting of properties must be set to add, remove, or preserve.';
        }
    })
    .action(function (value) {
        switch (value.toLowerCase()) {
        case 'add':
            options.quoteProperties = true;
            break;

        case 'preserve':
            options.quoteProperties = null;
            break;

        case 'remove':
            options.quoteProperties = false;
            break;
        }
    });

parser.addOption('v', 'verbose', 'Display filenames on stderr that are being processed.  Useful when combined with --in-place.')
    .action(function () {
        options.verbose = true;
    });

unparsed = parser.parse();

if (options.debug) {
    console.error('Options', options);
    console.error('Files', unparsed);
}

processFiles(unparsed, function (err, data, filename, done) {
    var pretty;

    if (err) {
        if (err.code === 'ENOENT') {
            console.error('File does not exist: ' + err.filename);
        } else {
            console.error('Unhandled error:', err);
        }

        return;
    }

    if (options.debug) {
        console.error('Successfully read', filename);
        console.error('Size before', data.length);
    }

    pretty = prettyJs(data, options);

    if (options.debug) {
        console.error('Size after', pretty.length);
    }

    if (options.verbose) {
        console.error(filename);
    }

    if (options.inPlace && filename !== '-') {
        if (options.debug) {
            console.log('Writing', filename);
        }

        fs.writeFile(filename, pretty, function (err) {
            if (err) {
                console.error(err);
            }

            if (options.debug) {
                console.log('Done writing file');
            }

            done();
        });
    } else {
        if (options.debug) {
            console.log('Writing to console');
        }

        console.log(pretty);
        done();
    }
});
