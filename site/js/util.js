function getElement(elementString) {
  if (elementString.startsWith("#")) {
    return document.getElementById(elementString.replace("#", ""));
  } else if (elementString.startsWith(".")) {
    return document.getElementsByClassName(elementString.replace(".", ""));
  } else {
    return document.getElementsByTagName(elementString);
  }
}

function execWhenLoaded(callback) {
  if (typeof(callback) != "function") {
    throw new TypeError("callback is not a function");
  } else {
    document.addEventListener("DOMContentLoaded", callback);
  }
}
