const threatmiddlware = (req, res, next) => {
  const bodyString = req.body == null ? "" : JSON.stringify(req.body);
  const payload = bodyString.toLowerCase();

  let threatDetected = false;
  let threatType = "None";

  if (payload.includes("<script>")) {
    threatDetected = true;
    threatType = "XSS";
  }
  if (
    payload.includes("or 1=1") ||
    payload.includes("'--") ||
    payload.includes("drop table")
  ) {
    threatDetected = true;
    threatType = "SQL Injection";
  }

  req.threatDetected = threatDetected;
  req.threatType = threatType;


    next();

};

module.exports = threatmiddlware;