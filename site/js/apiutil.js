function APIRequest(apicall) {
  var req = new XMLHttpRequest();
  req.open("GET", "http://localhost:8080/api?call=" + apicall, false);
  req.send();

  return JSON.parse(req.responseText);
}
