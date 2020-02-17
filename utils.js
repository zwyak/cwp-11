const fs = require('fs');
function byField(field){
  return (a, b) => a[field] > b[field] ? 1 : -1;
}

function sortArray(array, field, order){
  let result = array;
  result.sort( byField(field) );
  if (order == 'DESC') result.reverse();
  return result;
}

module.exports.sortArray = sortArray;

function writeJson(file, data){
  fs.writeFile(file, data, 'utf8', function (err) {
    if (err) {
        console.log("An error occured while writing JSON Object to File.");
        return console.log(err);
    }

    console.log("JSON file has been saved.");
  });
}

module.exports.writeJson = writeJson;
