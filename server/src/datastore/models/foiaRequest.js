const foiaRequest = (
  id,
  status,
  datetime_submitted,
  datetime_done,
  price,
  absolute_url
) => {
  return {
    id: id,
    status: status,
    datetime_submitted: datetime_submitted,
    datetime_done: datetime_done,
    price: price,
    absolute_url: absolute_url,
  }
};

module.exports = foiaRequest;