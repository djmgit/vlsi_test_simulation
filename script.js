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

function andGate(inputs) {
  var output = inputs[0];
  for (var i = 1; i < inputs.length; i++) {
    output = output & inputs[i];
  }

  return output;
}

function orGate(inputs) {
  var output = inputs[0];
  for (var i = 1; i < inputs.length; i++) {
    output = output | inputs[i];
  }

  return output;
}

function notGate(inputs) {
  var input = inputs[0];
  return input === 1 ? 0:1;
}

function nandGate(inputs) {
  return notGate(andGate(inputs));
}

function norGate(inputs) {
  return notGate(orGate(inputs));
}

function topologicalSort(graph) {
  var indergree = {}
  var nodes = [];
  var keys = Object.keys(graph);

  // get all nodes
  for (var i = 0; i < keys.length; i++) {
    nodes.push(keys[i]);
    nodes = nodes.concat(graph[keys[i]]);
  }

  nodes = Array.from(new Set(nodes));
  for (var i = 0; i < nodes.length; i++) {
    indergree[nodes[i]] = 0;
  }
  for (var i = 0; i < keys.length; i++) {
    var dependencies = graph[keys[i]];
    for (j = 0; j < dependencies.length; j++) {
      indergree[dependencies[j]] += 1;
    }
  }

  sorted = [];
  queue = [];
  for (var i = 0; i < nodes.length; i++) {
    if (indergree[nodes[i]] === 0) {
      queue.push(nodes[i]);
    }
  }

  while (queue.length !== 0) {
    var node = queue.shift();
    sorted.push(node);
    var dependencies = graph[node];
    if (dependencies) {
      for (var i = 0; i < dependencies.length; i++) {
        indergree[dependencies[i]] -= 1;
        if (indergree[dependencies[i]] === 0) {
          queue.push(dependencies[i]);
        }
      }
    }
  }

  return sorted;
}

function simulate(logicCircuit, sorted, inputVector) {
  var output = inputVector;

  for (var i = 0; i < sorted.length; i++) {
    continue;
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
  var logicCircuit = {};

  for (var i = 0; i < operations_total.length; i++) {
    var opr = operations_total[i];
    if (opr.length === 0) {
      continue;
    }
    var out = opr.split("=")[0].trim();
    var inp = opr.substring(opr.indexOf("(") + 1, opr.indexOf(")"));
    var inp = inp.split(", ");
    var gate = opr.split("=")[1].trim().substring(0, opr.indexOf("("));

    logicCircuit[out] = {
      'operation': gate,
      'inputs': inp
    }

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

  var sortedGraph = topologicalSort(graph);
  console.log("Topologically sorted graph");
  console.log(sortedGraph);

  // sample input

  var inputVector = {
    "G0": 1,
    "G1": 0,
    "G2": 1,
    "G3": 0,
    "G5": 1,
    "G6": 0,
    "G7": 1,
  }

  var output = simulate(logicCircuit, sortedGraph, inputVector);
}

document.getElementById('fileinput').addEventListener('change', readSingleFile, false);
