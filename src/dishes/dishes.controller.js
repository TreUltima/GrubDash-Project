const path = require("path");
const dishes = require(path.resolve("src/data/dishes-data"));
const nextId = require("../utils/nextId");

function create(req, res, next) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  const newDish = {
    id: nextId(),
    name: name,
    description: description,
    price: price,
    image_url: image_url,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

function dishExists(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    //res.locals as an empty object and we are assigning it to the dish that is found
    res.locals.dish = foundDish;
    return next();
  }
  next({ status: 404, message: `Dish does not exist: ${dishId}.` });
}


function idMatch(req, res, next) {
    const { dishId } = req.params;
    const { data: { id } = {} } = req.body;
    if (id) {
        if (id == dishId) {
            return next();
        }
        next({
            status: 400,
            message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
        });
    }
    next();
}
function dishHasId(req, res, next) {
  const foundDish = res.locals.dish;
  if (foundDish) {
    return next();
  }
  next({
    status: 404,
    message: `Dish does not exist: ${foundDish.id}`,
  });
}

function hasName(req, res, next) {
    const { data: { name } = {} } = req.body;
    if (name && name.length !== 0) {
    return next();
  }
  next({ status: 400, message: "Dish must include a 'name'" });
}

function hasDescription(req, res, next) {
  const { data: { description } = {} } = req.body;
  if (description && description.length !== 0) {
    return next();
  }
  next({ status: 400, message: "Dish must include a 'description'" });
}

function hasPrice(req, res, next) {
  const { data: { price } = {} } = req.body;
  if (price && price > 0 && Number.isInteger(price)) {
    return next();
  }
  next({ status: 400, message: "Dish must include a 'price'" });
}

function hasImageUrl(req, res, next) {
  const { data: { image_url } = {} } = req.body;
  if (image_url && image_url.length !== 0) {
    return next();
  }
  next({ status: 400, message: "Dish must include a 'image_url'" });
}


function list(req, res, next) {
  res.json({ data: dishes });
}

function read(req, res, next) {
  res.json({ data: res.locals.dish });
}

function update(req, res, next) {
  const foundDish = res.locals.dish;
  const { data: { name, description, image_url, price } = {} } = req.body;
  foundDish.name = name;
  foundDish.description = description;
  foundDish.image_url = image_url;
  foundDish.price = price;

  res.json({ data: foundDish });
}


module.exports = {
  list,
  read: [dishExists, read],
  update: [
    dishExists,
    dishHasId,
    idMatch,
    hasName,
    hasDescription,
    hasPrice,
    hasImageUrl,
    update,
  ],
  create: [hasName, hasImageUrl, hasDescription, hasPrice, create],
};