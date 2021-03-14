const fs = require("fs").promises;
const path = require("path");
const redisClient = require("../../redisClient");
const foiaData = require("../../models/foiaData");
const foiaItem = require("../../models/foiaItem");

const refDataDirPath = path.join(__dirname, "../../referenceData");

const ingestReference = async () => {
  const datastoreFilename = await _getMostRecentFilename(refDataDirPath);
  const fileContent = await fs.readFile(`${refDataDirPath}/${datastoreFilename}`, {
    encoding: "utf8",
  });
  const jsonContent = JSON.parse(fileContent);
  const data = foiaData(jsonContent.meta.runDate, jsonContent.foiaList);

  redisClient.set("runDate", data.meta.runDate);
  data.foiaList.map( item => {
    const foia = foiaItem(item.foiaReq, item.agency, item.jurisdiction);
    if (foia) {
      if (foia.foiaReq && foia.foiaReq.id) {
        redisClient.hset(`foiaRequest:${foia.foiaReq.id}`, "id", foia.foiaReq.id);
        redisClient.hset(`foiaRequest:${foia.foiaReq.id}`, "status", foia.foiaReq.status);
        redisClient.hset(`foiaRequest:${foia.foiaReq.id}`, "price", foia.foiaReq.price);
        redisClient.hset(`foiaRequest:${foia.foiaReq.id}`, "datetime_submitted", foia.foiaReq.datetime_submitted);
        redisClient.hset(`foiaRequest:${foia.foiaReq.id}`, "absolute_url", foia.foiaReq.absolute_url);
        if (foia.foiaReq.datetime_done) {
          redisClient.hset(`foiaRequest:${foia.foiaReq.id}`, "datetime_done", foia.foiaReq.datetime_done);
        }
      }
      if (foia.agency && foia.agency.id) {
        redisClient.hset(`agency:${foia.agency.id}`, "id", foia.agency.id);
        redisClient.hset(`agency:${foia.agency.id}`, "agencyName", foia.agency.agencyName);
      }
      if (foia.jurisdiction && foia.jurisdiction.id) {
        redisClient.hset(`jurisdiction:${foia.jurisdiction.id}`, "id", foia.jurisdiction.id);
        redisClient.hset(`jurisdiction:${foia.jurisdiction.id}`, "jurisdictionName", foia.jurisdiction.jurisdictionName);
      }
    }
  });
};

const _getMostRecentFilename = async (dir) => {
  const filenames = await _orderRecentFilenames(dir);
  const idx = filenames.length - 1;

  return filenames ? filenames[idx] : undefined;
};

const _orderRecentFilenames = async (dir) => {
  const filenamesList = await _readFilenames(dir);

  const sortedFilenames = filenamesList.sort((a, b) => a.localeCompare(b));

  return sortedFilenames;
};

const _readFilenames = async (dir) => {
  const dirContents = await fs.readdir(dir);

  // filter out directories
  const filenamesList = await Promise.all(
    await dirContents.filter(async (file) => {
      const stats = await fs.lstat(path.join(dir, file));
      return stats.isFile();
    })
  );

  // filter out unneeded files
  const filteredFilenamesList = filenamesList.filter((filename) =>
    filename.startsWith("fullDatastore")
  );

  return filteredFilenamesList;
};

(async function init() {
  await ingestReference();
})();
