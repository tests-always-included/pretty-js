"use strict";

var basePath, fs, path, prettyJs;

/**
 * Adds a scenario file as an expectation
 *
 * Each scenario file is a JSON encoded object with the following
 * properties:
 *
 * input:  The input string
 * output:  The expected output string
 * options:  Options to pass to prettyJs
 *
 * @param {string} directoryEntry
 */
function addScenario(directoryEntry) {
    var scenarioData;

    if (!directoryEntry.match(/\.json$/)) {
        return;
    }

    scenarioData = require(path.resolve(basePath, directoryEntry));
    it(directoryEntry + " is formatted correctly", function () {
        expect(prettyJs(scenarioData.input, scenarioData.options)).toEqual(scenarioData.output);
    });
}

path = require("path");
basePath = path.join(__dirname, "fixtures");
fs = require("fs");
prettyJs = require("../");

describe("scenarios", function () {
    var files;

    files = fs.readdirSync(basePath); // eslint-disable-line no-sync
    files.forEach(addScenario);
});
