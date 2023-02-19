const router = require("express").Router();
const orderController = require("./orders.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");

router
  .route("/:orderId")
  .get(orderController.read)
  .put(orderController.update)
  .delete(orderController.destory)
  .all(methodNotAllowed);

router
  .route("/")
  .get(orderController.list)
  .post(orderController.create)
  .all(methodNotAllowed);

module.exports = router;