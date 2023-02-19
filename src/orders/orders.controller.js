const path = require("path");
const orders = require(path.resolve("src/data/orders-data"));
const nextId = require("../utils/nextId");

function list(req, res, next) {
  res.json({ data: orders });
}

function read(req, res, next) {
  res.json({ data: res.locals.order });
}

function create(req, res, next) {
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;

  let newOrder = {
    id: nextId(),
    deliverTo: deliverTo,
    mobileNumber: mobileNumber,
    status: status,
    dishes: dishes,
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

function update(req, res, next) {
  const { data: { id, deliverTo, mobileNumber, status, dishes } = {} } = req.body
  const foundOrder = res.locals.order

  foundOrder.deliverTo = deliverTo
  foundOrder.mobileNumber = mobileNumber
  foundOrder.status = status
  foundOrder.dishes = dishes

  res.json({ data: foundOrder });
}

function destory(req, res, next) {
  const { orderId } = req.params;
  const index = orders.findIndex((order) => order.id === orderId);
  if (orders[index].status !== "pending") {
    next({
      status: 400,
      message: `An order cannot be deleted unless it is pending. Returns a 400 status code`,
    });
  }
  if (orderId && index > -1) {
    orders.splice(index, 1);
  }
  res.sendStatus(204);
}

function orderExists(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);
  if (foundOrder) {
    res.locals.order = foundOrder;
    return next();
  }
  next({
    status: 404,
    message: `Order id not found: ${orderId}`,
  });
}

function orderHasId(req, res, next) {
  const foundOrder = res.locals.order;
  if (foundOrder) {
    return next();
  }
  next({
    status: 404,
    message: `Dish does not exist: ${foundOrder.id}`,
  });
}

function idMatch(req, res, next) {
  const { orderId } = req.params;
  const { data: { id } = {} } = req.body;
  if (id) {
    if (id == orderId) {
      return next();
    }
    next({
      status: 400,
      message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`,
    });
  }
  next();
}

function hasDeliverTo(req, res, next) {
  const { data: { deliverTo } = {} } = req.body;
  if (!deliverTo || deliverTo === "") {
    next({ status: 400, message: "Order must include a deliverTo" });
  }
  return next();
}

function hasMobileNumber(req, res, next) {
  const { data: { mobileNumber } = {} } = req.body;
  if (!mobileNumber || mobileNumber === "") {
    next({ status: 400, message: "Order must include a mobileNumber" });
  }
  return next();
}

function hasStatus(req, res, next) {
  const { data: { status } = {} } = req.body;
  if (!status || status === "" || status === "invalid") {
    next({
      status: 400,
      message: `Order must have a status of pending, preparing, out-for-delivery, delivered`,
    });
  }
  if (status === "delivered") {
    next({ status: 400, message: `A delivered order cannot be changed` });
  }
  return next();
}

function hasDishes(req, res, next) {
  const { data: { dishes } = {} } = req.body;
  if (!dishes) {
    next({ status: 400, message: "Order must include a dish" });
  }
  if (dishes.length === 0 || !Array.isArray(dishes)) {
    next({ status: 400, message: "Order must include at least one dish" });
  }
  for (dish of dishes) {
    const index = dishes.indexOf(dish);
    if (
      !dish.quantity ||
      dish.quantity < 1 ||
      !Number.isInteger(dish.quantity)
    ) {
      next({
        status: 400,
        message: `Dish ${index} must have a quantity that is an integer greater than 0`,
      });
    }
  }
  return next();
}

module.exports = {
  update: [
    orderExists,
    orderHasId,
    idMatch,
    hasDeliverTo,
    hasMobileNumber,
    hasStatus,
    hasDishes,
    update,
  ],
  read: [orderExists, read],
  orderExists,
  destory: [orderExists, destory],
  create: [
    hasDeliverTo, 
    hasMobileNumber, 
    hasDishes, 
    create],
  list,
};