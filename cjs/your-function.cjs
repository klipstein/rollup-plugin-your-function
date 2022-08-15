'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var pluginutils = require('@rollup/pluginutils');
var MagicString = require('magic-string');
var diff = require('diff');
var colorette = require('colorette');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var MagicString__default = /*#__PURE__*/_interopDefaultLegacy(MagicString);

/**
 * Adds an angle bracket to each line of a
 * text section.
 * @param {string} angle - '>' or '<'
 * @param {string} txt - The text section.
 * @returns {string} - The given text section with an angle bracket and a space in front of each line. 
 */
const addAngles = (angle, txt) => {
    const txtArr = txt.split("\n");
    let lastChar = "";
    if (txt.at(-1) === "\n") {
        lastChar = "\n";
        txtArr.pop();
    }
    let output = txtArr.map(line => `${angle} ${line}`).join("\n");
    output += lastChar;
    return output;
};


/**
 * Prints an output in the mould of GNU diff when
 * called with no parameters other than the files.
 * But more picturesque, thanks to red and green
 * colors...
 * Also possible is a "file" mode. This variant
 * shows the whole file with added and removed
 * lines.
 * @param {string} source - The original code.
 * @param {string} code - The modified code.
 * @param {string} [diffOption] - As passed by the user. If the value is 'file' also unchanged code is printed.  
 */
const showDiff = (filename, source, code, diffOption) => {
    const fileMode = diffOption == "file";
    console.log(code);

    console.log(colorette.bold(colorette.blue(
        `(plugin manipulate) diff for file '${filename}':`
    )));
    
    console.log(colorette.gray("BEGIN >>>"));

    if (fileMode) {
        const diff$1 = diff.diffLines(source, code);

        let message = "";
        
        diff$1.forEach((part) => {
            let msg;
            if (part.added) {
                msg = colorette.green(addAngles(">", part.value));
            } else if (part.removed) {
                msg = colorette.red(addAngles("<", part.value));
            } else {
                msg = part.value;
            }
            message += msg;
        });
        
        console.log(message);
    
    }
        
    else {
        const diff$1 = diff.structuredPatch("", "", source, code, "", "", {
            context: 0
        });
        
        for (const part of diff$1.hunks) {

            // add
            if (part.oldLines === 0) {
                let info = `${part.oldStart}a${part.newStart}`;
                if (part.newLines > 1) {
                    info += `,${part.newStart+part.newLines-1}`;
                }
                console.log(colorette.bold(info));
                part.lines.forEach(line => console.log(colorette.green(`> ${line.slice(1)}`)));
            }
            
            // delete
            else if (part.newLines === 0) {
                let info = String(part.oldStart);
                if (part.oldLines > 1) {
                    info += `,${part.oldStart+part.oldLines-1}`;
                }
                info += `d${part.newLines}`;
                console.log(colorette.bold(info));
                part.lines.forEach(line => console.log(colorette.red(`< ${line.slice(1)}`)));
            }
            
            // change
            else {
                let info = String(part.oldStart);
                if (part.oldLines > 1) {
                    info += `,${part.oldStart+part.oldLines-1}`;
                }
                info += `c${part.newStart}`;
                if (part.newLines > 1) {
                    info += `,${part.newStart+part.newLines-1}`;
                }
                console.log(colorette.bold(info));
                
                let plus = false;
                part.lines.forEach((line, i) => {
                    if (plus) {
                        console.log(colorette.green(`> ${line.slice(1)}`));
                    } else {
                        console.log(colorette.red(`< ${line.slice(1)}`));
                        if (part.lines[i+1].at(0) === "+") {
                            console.log("---");
                            plus = true;
                        }
                    }
                });
            }
        }
    }
     
    console.log(colorette.gray("<<< END\n"));
};

/**
 * [rollup-plugin-your-function]{@link https://github.com/UmamiAppearance/rollup-plugin-yor-function}
 *
 * @version 0.1.2
 * @author UmamiAppearance [mail@umamiappearance.eu]
 * @license MIT
 */

const yourFunction = (options={}) => {

    if (!options.fn) {
        throw Error("A function must be specified");
    }

    const filter = pluginutils.createFilter(options.include, options.exclude);

    return {
        name: "manipulate",

        transform(source, id) {
            if (filter(id)) {
                
                const code = options.fn(source);

                if ("showDiff" in options && code !== source) {
                    showDiff(id, source, code, options.showDiff);
                }
                
                let map;

                if (options.sourceMap !== false && options.sourcemap !== false) {
                    const ms = new MagicString__default["default"](code);
                    map = ms.generateMap({ hires: true });
                }

                return { code, map };
            }
        }
    };
};

exports.yourFunction = yourFunction;
//# sourceMappingURL=your-function.cjs.map
