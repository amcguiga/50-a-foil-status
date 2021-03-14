const agency = require("./agency");
const foiaRequest = require("./foiaRequest");
const jurisdiction = require("./jurisdiction");

const foiaItem = (
  foia,
  agen,
  juris
) => {
  // console.log(`foia: ${JSON.stringify(foia)}`)
  // console.log(`agency: ${JSON.stringify(agen)}`)
  // console.log(`jurisdiction: ${JSON.stringify(juris)}`)
  const f = foiaRequest(foia.id, foia.status, foia.datetime_submitted, foia.datetime_done, foia.price, foia.absolute_url);
  const a = agency(agen.id, agen.agencyName);
  const j = jurisdiction(juris.id, juris.jurisdictionName);

  if (f && a && j) {
    return {
      foiaReq: f,
      agency: a,
      jurisdiction: j
    };
  }
};

module.exports = foiaItem;