console.log("hello world");

if (window.File && window.FileReader && window.FileList && window.Blob) {
  console.log("success!!");
} else {
  alert('The File APIs are not fully supported in this browser.');
}

function readSingleFile(evt) {
  //Retrieve the first (and only!) File from the FileList object
  var f = evt.target.files[0]; 

  if (f) {
    var r = new FileReader();
    r.onload = function(e) { 
      var contents = e.target.result;
      processFile(contents);
    }
    r.readAsText(f);
  } else { 
    alert("Failed to load file");
  }
}

function processFile(fileContent) {
  var blocks = fileContent.split("\n\n");
  
  var declarations = blocks[0];
  var inputs = blocks[1];
  var outputs = blocks[2];
  var operations = blocks.slice(3);

  inputs = inputs.split("\n");
  outputs = outputs.split("\n");
  declarations = declarations.split("\n");

  inputs = inputs.map(input => input.substring(input.indexOf('(') + 1, input.indexOf(')')));

  outputs = outputs.map(output => output.substring(output.indexOf('(') + 1, output.indexOf(')')));

  var operations_total = [];
  for (var i = 0; i < operations.length; i++) {
    var operationTemp = operations[i];
    if (operationTemp !== undefined) {
      operations_total = operations_total.concat(operationTemp.split("\n"));
    }
  }

  var fileName = declarations[0].split(" ")[1];
  var inputsNumber = declarations[1].split(" ")[1];
  var outputsNumber = declarations[2].split(" ")[1];

  var graph = {};

  for (var i = 0; i < operations_total.length; i++) {
    var opr = operations_total[i];
    if (opr.length === 0) {
      continue;
    }
    out = opr.split("=")[0].trim();
    inp = opr.substring(opr.indexOf("(") + 1, opr.indexOf(")"));
    inp = inp.split(", ");
    for (var j = 0; j < inp.length; j++) {
      var input = inp[j].trim();
      if (graph[input] === undefined) {
        graph[input] = [];
      }
      graph[input].push(out);
    }
  }

  console.log(fileName);
  console.log(inputsNumber);
  console.log(outputsNumber);

  console.log(graph);

  // Graph visualization
  var vizGraph = new Springy.Graph();
  var vizGraphNodes = {}

  var graphKeys = Object.keys(graph);
  for(var i = 0; i < graphKeys.length; i++){
    var key = graphKeys[i];
    var edge_array = graph[key];
    if(!vizGraphNodes[key]){
      vizGraphNodes[key] = vizGraph.newNode({label: key});      
    }
    for(var jjj = 0; jjj < edge_array.length; jjj++){
      console.log("=============");
      console.log(key, edge_array[jjj]);
      if(!vizGraphNodes[edge_array[jjj]]){
        vizGraphNodes[edge_array[jjj]] = vizGraph.newNode({label: edge_array[jjj]});
      }
      vizGraph.newEdge(vizGraphNodes[key], vizGraphNodes[edge_array[jjj]]);
    }

  }
  console.log(vizGraph);

  $('#my_canvas').springy({ graph: vizGraph });


}

document.getElementById('fileinput').addEventListener('change', readSingleFile, false);