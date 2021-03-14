const foiaItem = require("./foiaItem");

const foiaData = (
  runDate,
  foiaList,
) => {
  const list = foiaList.map(item => foiaItem(item.foiaReq, item.agency, item.jurisdiction))
  if (runDate && list) {
    return {
      meta: {
        runDate: runDate
      },
      foiaList: list
    };
  }
};

module.exports = foiaData;