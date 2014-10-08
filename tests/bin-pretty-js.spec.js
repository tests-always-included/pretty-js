/*global beforeEach, describe, expect, it, jasmine, require*/
(function () {
    'use strict';

    var childProcess;

    function runCmd(args, callback) {
        var cmd;

        cmd = 'echo "stdin" | bin/pretty-js.js -d ' + args;
        childProcess.exec(cmd, function (err, stdout, stderr) {
            expect(err).toBe(null);
            callback(stderr, stdout);
        });
    }

    function argumentRunner(arg, text) {
        it('handles ' + JSON.stringify(arg), function (done) {
            runCmd(arg, function (result) {
                expect(result).toContain(text);
                done();
            });
        });
    }

    childProcess = require('child_process');

    describe('bin/pretty-js.js', function () {
        describe('with no arguments', function () {
            it('uses stdin', function (done) {
                runCmd('', function (result) {
                    expect(result).toContain('Writing to console');
                    done();
                });
            });
        });

        describe('bom', function () {
            argumentRunner('', 'bom: false');
            argumentRunner('-b add', 'bom: true');
            argumentRunner('-b=add', 'bom: true');
            argumentRunner('--bom=add', 'bom: true');
            argumentRunner('--bom add', 'bom: true');
            argumentRunner('-b remove', 'bom: false');
            argumentRunner('-b=remove', 'bom: false');
            argumentRunner('--bom=remove', 'bom: false');
            argumentRunner('--bom remove', 'bom: false');
            argumentRunner('-b preserve', 'bom: null');
            argumentRunner('-b=preserve', 'bom: null');
            argumentRunner('--bom=preserve', 'bom: null');
            argumentRunner('--bom preserve', 'bom: null');
        });
        describe('commentSpace', function () {
            argumentRunner('', 'commentSpace: \'  \'');
            argumentRunner('-s " "', 'commentSpace: \' \'');
            argumentRunner('--comment-space="\t"', 'commentSpace: \'\\t\'');
        });
        describe('convertStrings', function () {
            argumentRunner('', 'convertStrings: \'double\'');
            argumentRunner('--convert-strings double', 'convertStrings: \'double\'');
            argumentRunner('--convert-strings="single"', 'convertStrings: \'single\'');
            argumentRunner('-c preserve', 'convertStrings: null');
        });
        describe('elseNewline', function () {
            argumentRunner('', 'elseNewline: false');
            argumentRunner('-e', 'elseNewline: true');
            argumentRunner('--else-newline', 'elseNewline: true');
        });
        describe('help', function () {
            it('does not display help by default', function (done) {
                runCmd('', function (result, stdout) {
                    /*jslint unparam:true*/
                    expect(stdout).not.toContain('This help message');
                    done();
                });
            });
            it('works with --help', function (done) {
                runCmd('-h', function (result, stdout) {
                    /*jslint unparam:true*/
                    expect(stdout).toContain('This help message');
                    done();
                });
            });
            it('works with -h', function (done) {
                runCmd('-h', function (result, stdout) {
                    /*jslint unparam:true*/
                    expect(stdout).toContain('This help message');
                    done();
                });
            });
        });
        describe('inPlace', function () {
            argumentRunner('', 'inPlace: false');
            argumentRunner('-i', 'inPlace: true');
            argumentRunner('--in-place', 'inPlace: true');
        });
        describe('indent', function () {
            argumentRunner('', 'indent: \'    \'');
            argumentRunner('-t "waffle"', 'indent: \'waffle\'');
            argumentRunner('--indent="\t"', 'indent: \'\\t\'');
        });
        describe('jslint', function () {
            argumentRunner('', 'jslint: false');
            argumentRunner('-l', 'jslint: true');
            argumentRunner('--jslint', 'jslint: true');
        });
        describe('json', function () {
            // These are without the flag
            argumentRunner('--bom=add', 'bom: true');
            argumentRunner('--convert-strings=single', 'convertStrings: \'single\'');
            argumentRunner('--jslint', 'jslint: true');
            argumentRunner('--quote-properties=remove', 'quoteProperties: false');

            // These are with the flag
            argumentRunner('--bom=add -j', 'bom: false');
            argumentRunner('--convert-strings=single -j', 'convertStrings: \'double\'');
            argumentRunner('--jslint --json', 'jslint: false');
            argumentRunner('--quote-properties=remove --json', 'quoteProperties: true');
        });
        describe('newline', function () {
            argumentRunner('', 'newline: \'\\n\'');
            argumentRunner('--newline "crlf"', 'newline: \'\\r\\n\'');
            argumentRunner('-n CR', 'newline: \'\\r\'');
        });
        describe('quoteProperties', function () {
            argumentRunner('', 'quoteProperties: false');
            argumentRunner('-q=add', 'quoteProperties: true');
            argumentRunner('--quote-properties remove', 'quoteProperties: false');
            argumentRunner('--quote-properties preserve', 'quoteProperties: null');
        });
        describe('verbose', function () {
            argumentRunner('', 'verbose: false');
            argumentRunner('-v', 'verbose: true');
            argumentRunner('--verbose', 'verbose: true');
        });
    });
}());