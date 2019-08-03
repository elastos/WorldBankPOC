exports.responseBetterJson = (res, input, output) => {
  const retString = '<html><body><h1>Input</h1><pre><code>'
    + JSON.stringify(input, undefined, 2) + 
    '</code></pre><h1>Output</h1><pre><code>' 
    + JSON.stringify(output, undefined, 2)
    + '</code></pre></body></html>';
  res.send(retString);
}
