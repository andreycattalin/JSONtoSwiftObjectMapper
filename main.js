var parsedClasses = [];
var parsedClassesNames = [];

$(document).ready(function () {

    $("#transform").click(function () {
        printMapped(generateClass());
    });

    $("#download").click(function () {
        var firstClassName = $('#first-class').val();
        downloadFile(firstClassName + '.swift', generateClass());
    });

});

var dataType = {
    Any: 'Any',
    String: 'String',
    Int: 'Int',
    Float: 'Float',
    Number: 'NSNumber',
    Bool: 'Bool',
    ArrayOfStrings: '[String]',
}

function generateClass() {
    parsedClasses = [];
    parsedClassesNames = [];

    $('#print-square').text(' ');
    var jsonToParse = $('#jsontoparse').val();
    var firstClassName = $('#first-class').val();
    try {
        var jsonData = $.parseJSON(jsonToParse);
        parseMapper(jsonData, firstClassName);
    } catch (error) {
        console.log(error);
        $('#print-square').text('Error ' + error.message);
    }

    var imports = '' +
        'import Foundation \n' +
        'import ObjectMapper \n\n';

    return imports + parsedClasses.reverse().join('');
}

function writeClass(name, vars) {

    var classComp = "";

    classComp += 'class ' + name + ': Mappable { \n\n';

    for (const key in vars) {
        if (vars.hasOwnProperty(key)) {
            const element = vars[key];
            if ($.isNumeric(key)) {
                classComp += '\tvar _' + key + ': ' + capitalizeFirstLetter(camelize(element)) + '? \n';
            } else {
                classComp += '\tvar ' + camelize(key) + ': ' + capitalizeFirstLetter(camelize(element)) + '? \n';
            }
        }
    }

    classComp += '\n' +
        '\trequired init?(map: Map){' +
        ' \n' +
        '\t} \n';

    classComp += '\n' +
        '\tfunc mapping(map: Map) {\n';

    for (const key in vars) {
        if (vars.hasOwnProperty(key)) {
            const element = vars[key];
            if ($.isNumeric(key)) {
                classComp += '\t\t_' + key + ' <- map["' + key + '"] \n';
            } else {
                classComp += '\t\t' + camelize(key) + ' <- map["' + key + '"] \n';
            }
        }
    }

    classComp += '\t}\n';


    classComp += '} \n\n';

    return classComp;
}

function parseMapper(jsonData, firstClassName) {
    try {

        var objectVars = [];
        var objectMaps = "";

        for (const key in jsonData) {
            if (jsonData.hasOwnProperty(key)) {
                const element = jsonData[key];

                if (typeof element === 'number') {
                    objectVars[key] = dataType.Number;
                    // if (element % 1 === 0) {
                    //     objectVars[key] = dataType.Int;
                    // }
                    // } else {
                    //     objectVars[key] = dataType.Float;
                    // }
                } else {
                    if ($.isArray(element)) {
                        var typeArray;
                        for (const i in element) {
                            if (element.hasOwnProperty(i)) {
                                const valueArray = element[i];

                                if ($.type(valueArray) === 'string') {
                                    typeArray = 'string';
                                    break;
                                } else {
                                    typeArray = null;
                                    break;
                                }

                            }
                        }

                        if (typeArray == 'string') {
                            objectVars[key] = dataType.ArrayOfStrings;
                        } else {
                            objectVars[key] = '[' + capitalizeFirstLetter(key) + ']';
                            parseMapper(element[0], capitalizeFirstLetter(key));
                        }
                    } else if (typeof element == 'object') {
                        if (!element) {
                            objectVars[key] = dataType.Any;
                        } else {
                            objectVars[key] = capitalizeFirstLetter(key);
                            parseMapper(element, capitalizeFirstLetter(key));
                        }
                    } else if (typeof element === 'boolean') {
                        objectVars[key] = dataType.Bool;
                    } else {
                        objectVars[key] = dataType.String;
                    }
                }

            }

        }

        var nameOfClass = capitalizeFirstLetter(camelize(firstClassName));
        if (parsedClassesNames.indexOf(nameOfClass) == -1) {
            parsedClassesNames.push(nameOfClass);
            parsedClasses.push(writeClass(nameOfClass, objectVars));
        }

    } catch (error) {
        console.log(error);
        $('#print-square').text('Error ' + error.message);
    }
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function camelize(str) {
    return str.replace(/[^A-Za-z0-9]/g, ' ').replace(/^\w|[A-Z]|\b\w|\s+/g, function (match, index) {
        if (+match === 0 || match === '-' || match === '.') {
            return "";
        }
        return index === 0 ? match.toLowerCase() : match.toUpperCase();
    });
}

function print(data) {
    $('#print-square').html(data);
}

function printMapped(data) {
    $('#print-mapped').html(data);
}

function downloadFile(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}