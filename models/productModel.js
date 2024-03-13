const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "please enter a product name"],
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    price: {
      type: Number,
      require: true,
    },
    image: {
      image: String,
    },
  },
  { timeStamp: true }
);

const product = mongoose.model("product", productSchema);
module.exports = product;
