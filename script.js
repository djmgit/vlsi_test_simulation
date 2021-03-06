console.log("hello world");

if (window.File && window.FileReader && window.FileList && window.Blob) {
  console.log("success!!");
} else {
  alert('The File APIs are not fully supported in this browser.');
}

// reading file using browser file API

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

// global parameters

var inputsGlobal = "";
var outputsGlobal = "";
var logicCircuitGlobal = "";
var curcuitGraphGlobal = "";
var faultsGlobal = {};

var andGate = function(inputs) {
  var output = inputs[0];
  for (var i = 1; i < inputs.length; i++) {
    output = output & inputs[i];
  }

  return output;
}

// definition of logic gates

var orGate = function(inputs) {
  var output = inputs[0];
  for (var i = 1; i < inputs.length; i++) {
    output = output | inputs[i];
  }

  return output;
}

var notGate = function(inputs) {
  var input = inputs[0];
  return input === 1 ? 0:1;
}

var nandGate = function(inputs) {
  return notGate([andGate(inputs)]);
}

var norGate = function(inputs) {
  return notGate([orGate(inputs)]);
}

var buffGate = function(inputs) {
  return inputs[0];
}

var xorGate =function(inputs) {
  var output = inputs[0];
  for (var i = 1; i < inputs.length; i++) {
    var output2 = inputs[i];
    output = orGate([andGate([notGate([output]), output2]), andGate([notGate([output2]), output])]);
  }

  return output;
}

var operate = {
  "AND": andGate,
  "OR": orGate,
  "NOT": notGate,
  "NAND": nandGate,
  "NOR": norGate,
  "BUFF": buffGate,
  "XOR": xorGate
}

// logic for topological sort

function topologicalSort(graph) {
  var indergree = {}
  var nodes = [];
  var keys = Object.keys(graph);

  // geting all graph nodes and storing them in a single list

  for (var i = 0; i < keys.length; i++) {
    nodes.push(keys[i]);
    nodes = nodes.concat(graph[keys[i]]);
  }

  // removing duplicates

  nodes = Array.from(new Set(nodes));

  // calculating indegree of each node

  for (var i = 0; i < nodes.length; i++) {
    indergree[nodes[i]] = 0;
  }
  for (var i = 0; i < keys.length; i++) {
    var dependencies = graph[keys[i]];
    for (j = 0; j < dependencies.length; j++) {
      indergree[dependencies[j]] += 1;
    }
  }

  // topological sort logic

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

// method to simulate output generation

function simulate(logicCircuit, sorted, inputVector) {
  var output = inputVector;

  // see if any primary input line is faulty

  var inputs = Object.keys(inputVector);
  for (var i = 0; i < inputs.length; i++) {
    if (faultsGlobal[inputs[i]] !== undefined) {
      output[inputs[i]] = faultsGlobal[inputs[i]];
    }
  }

  for (var i = 0; i < sorted.length; i++) {
    if (!logicCircuit[sorted[i]]) {
      continue;
    }
    if (faultsGlobal[sorted[i]] !== undefined) {
      output[sorted[i]] = faultsGlobal[sorted[i]];
    } else {
      var inputs = logicCircuit[sorted[i]].inputs;
      inputs = inputs.map(input => output[input]);
      var gate = logicCircuit[sorted[i]].operation;
      gate = operate[gate];
      output[sorted[i]] = gate(inputs);
    }
  }

  return output;
}

// parsing bench file and creating dependency graph and logic circuit

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
    var gate = opr.split("=")[1].trim();
    var gate = gate.substring(0, gate.indexOf("("));

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

  // set global params

  inputsGlobal = inputs;
  outputsGlobal = outputs;
  logicCircuitGlobal = logicCircuit;
  curcuitGraphGlobal = sortedGraph;

  $(".label-input").html("Enter input vector for (" + inputs.join(", ") + ") separated by comma");

}

document.getElementById('fileinput').addEventListener('change', readSingleFile, false);

// method to create fault object

function generateFaults(faults) {
  faults = faults.split(",");
  faults = faults.map(input => input.trim());
  
  for (var i = 0; i < faults.length; i++) {
    fault = faults[i].split(":");
    faultsGlobal[fault[0].trim()] = parseInt(fault[1].trim());
  }
}

// method to run simulation

function runSimulation() {
  var inputVector = {};
  var inputUser = $(".primary-inputs").val();
  inputUser = inputUser.split(",");
  inputUser = inputUser.map(input => input.trim());

  for (var i = 0; i < inputsGlobal.length; i++) {
    inputVector[inputsGlobal[i]] = parseInt(inputUser[i]);
  }

  var faults = $(".faults").val();
  if (faults.length !== 0) {
    generateFaults(faults);
  } else {
    faultsGlobal = {};
  }

  // running a simulation

  var simulationOutput = simulate(logicCircuitGlobal, curcuitGraphGlobal, inputVector);
  console.log("output");
  var finalOutputs = {};
  for (var i = 0; i < outputsGlobal.length; i++) {
    finalOutputs[outputsGlobal[i]] = simulationOutput[outputsGlobal[i]];
  }
  
  var outputUser = "";
  var outputGates = Object.keys(finalOutputs);
  for (var  i = 0; i < outputGates.length; i++) {
    outputUser += (outputGates[i] + " : " + finalOutputs[outputGates[i]] + "<br>");
  }

  $(".primary-outputs").html(outputUser);

}

$(".simulate").click(runSimulation);
