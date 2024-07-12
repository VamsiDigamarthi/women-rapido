import FeedbackModel from "../Modals/FeedbackModal.js";
import OrderModel from "../Modals/OrderModal.js";
import BannerOffersModel from "../Modals/BannerOffersModal.js";

export const onPlaceOrder = async (req, res) => {
  const { user } = req;
  const {
    dropLangitude,
    dropLongitude,
    pickupLangitude,
    pickupLongitude,
    pickupAddress,
    dropAddress,
    price,
    orderPlaceTime,
    orderPlaceDate,
    vehicleType,
    parcelType,
    deliveryInstruction,
  } = req.body;

  try {
    if (user.role !== "user") {
      return res
        .status(403)
        .json({ message: "You can't access this feature!" });
    }

    const orderData = {
      price,
      vehicleType,
      orderPlaceDate,
      orderPlaceTime,
      head: user._id,
      pickupAddress,
      dropAddress,
      parcelType,
      deliveryInstruction,
      pickup: {
        type: "Point",
        coordinates: [parseFloat(pickupLongitude), parseFloat(pickupLangitude)],
      },
      drop: {
        type: "Point",
        coordinates: [parseFloat(dropLongitude), parseFloat(dropLangitude)],
      },
      userAuthenticationImage: req.file ? req.file.path : null,
    };

    const order = new OrderModel(orderData);
    await order.save();

    return res
      .status(201)
      .json({ message: "Order placed successfully!", order });
  } catch (error) {
    console.error("Place Order Faield", error);
    return res
      .status(500)
      .json({ message: "Place Order Faield", error: error.message });
  }
};

export const OnShowStatusOfOrder = async (req, res) => {
  const { orderId } = req.params;
  try {
    const order = await OrderModel.findOne({ _id: orderId }).populate(
      "acceptCaptain"
    );
    // console.log(order);
    if (order) {
      if (order?.status === "pending") {
        return res
          .status(200)
          .json({ message: "Your Order still Pending...!" });
      } else if (order.status === "accept") {
        return res.status(200).json(order);
      } else if (order.status === "completed") {
        return res
          .status(200)
          .json({ message: "Your Ride is completed...!", order });
      }
    }
  } catch (error) {
    console.error("Order status Faield", error);
    return res
      .status(500)
      .json({ message: "Order status Faield", error: error.message });
  }
};

export const onFetchAllOrders = async (req, res) => {
  const { user } = req;
  try {
    if (user.role !== "user") {
      return res
        .status(403)
        .json({ message: "You can't access this feature!" });
    }

    const orders = await OrderModel.find({ head: user._id });

    return res.status(200).json(orders);
  } catch (error) {
    console.error("Place Order Faield", error);
    return res
      .status(500)
      .json({ message: "Place Order Faield", error: error.message });
  }
};

export const onFetchRejectedOrders = async (req, res) => {
  const { user } = req;
  try {
    const rejectedOrder = await OrderModel.find({
      orderPlaceDate: req.params.currentData,
      status: "rejected",
      head: user._id,
    });

    return res.status(200).json(rejectedOrder);
  } catch (error) {
    console.error("Rejected Orders  Faield", error);
    return res
      .status(500)
      .json({ message: "Rejected Orders Faield", error: error.message });
  }
};

export const onRePlaceOrder = async (req, res) => {
  const { user } = req;
  try {
    await OrderModel.findByIdAndUpdate(
      { _id: req.params.orderId, head: user._id },
      {
        $set: {
          status: "pending",
          orderPlaceDate: req.body.orderPlaceTime,
          orderPlaceTime: req.body.orderPlaceDate,
          rejectedCaptaine: [],
        },
      },
      { new: true }
    );

    return res.status(201).json({ message: "Re-place ordered...!" });
  } catch (error) {
    console.error("re-place order  Faield", error);
    return res
      .status(500)
      .json({ message: "re-place order Faield", error: error.message });
  }
};

export const onAddFavoriteOrder = async (req, res) => {
  const { orderId } = req.params;
  // console.log(orderId);
  try {
    const order = await OrderModel.findOne({ _id: orderId });
    order.favorite = !order.favorite;
    order.save();
    return res.status(201).json({ message: "Updated...!" });
  } catch (error) {
    console.error("favorite Order  Faield", error);
    return res
      .status(500)
      .json({ message: "favorite Order Faield", error: error.message });
  }
};

export const onAddSavedOrder = async (req, res) => {
  const { orderId } = req.params;
  try {
    const order = await OrderModel.findOne({ _id: orderId });
    order.saved = !order.saved;
    order.save();
    return res.status(201).json({ message: "Updated...!" });
  } catch (error) {
    console.error("saved  Order  Faield", error);
    return res
      .status(500)
      .json({ message: "saved  Order Faield", error: error.message });
  }
};

export const onSavedOrdersFetch = async (req, res) => {
  const { user } = req;
  try {
    const savedOrders = await OrderModel.find({ head: user._id, saved: true });

    return res.status(200).json(savedOrders);
  } catch (error) {
    console.error("saved  Order fetch Faield", error);
    return res
      .status(500)
      .json({ message: "saved  Order fetch Faield", error: error.message });
  }
};

// feed back
export const onAddFeedBack = async (req, res) => {
  const { user } = req;
  try {
    const docs = new FeedbackModel({
      text: req.body.text,
      head: user._id,
    });
    await docs.save();

    return res.status(201).json({ message: "Thank You for your support..!" });
  } catch (error) {
    console.error("Feed back added  Faield", error);
    return res
      .status(500)
      .json({ message: "Feed back added  Faield", error: error.message });
  }
};

// first fetch completed order afer writen reviews
export const onFetchCompletedOrder = async (req, res) => {
  const { orderId } = req.params;
  const { user } = req;
  try {
    const completedOrder = await OrderModel.findOne({
      _id: orderId,
      head: user._id,
      status: "completed",
    }).populate({
      path: "acceptCaptain",
      select: "name mobile", // Only 'name' and 'mobile' fields will be populated
    });

    return res.status(200).json(completedOrder);
  } catch (error) {
    console.error("Fetch Completed order  Faield", error);
    return res
      .status(500)
      .json({ message: "Fetch Completed order  Faield", error: error.message });
  }
};

// review
export const onWriteReviews = async (req, res) => {
  const { orderId } = req.params;
  const { reviewRating, reviewTest, giveVehicleNumber } = req.body;
  try {
    await OrderModel.findByIdAndUpdate(
      { _id: orderId },
      {
        $set: {
          reviewRating,
          reviewTest,
          giveVehicleNumber,
        },
      },
      { new: true }
    );
    return res.status(201).json({ message: "reviews added succesfully...!" });
  } catch (error) {
    console.error("Post review Faield", error);
    return res
      .status(500)
      .json({ message: "Post review Faield", error: error.message });
  }
};

// cancel order

export const onCancelOrder = async (req, res) => {
  const { user } = req;
  const { orderId } = req.params;
  const { reason } = req.body;
  try {
    const updatedOrder = await OrderModel.findOneAndUpdate(
      { _id: orderId }, // Ensure only the order owner can cancel
      {
        $set: {
          cancelReason: {
            user: user._id,
            reason: reason,
          },
          status: "cancelled", // Optionally update the status to 'cancelled'
        },
      },
      { new: true } // Return the updated document
    );

    return res
      .status(201)
      .json({ message: "Order Canceled....!", updatedOrder });
  } catch (error) {
    console.error("Cancel Order Faield", error);
    return res
      .status(500)
      .json({ message: "Cancel Order Faield", error: error.message });
  }
};

export const onFetchOffersBanners = async (req, res) => {
  try {
    const bannerOffers = await BannerOffersModel.find({});

    return res.status(200).json(bannerOffers);
  } catch (error) {
    console.error("Holding Captaine failed", error);
    return res
      .status(500)
      .json({ message: "Holding Captaine failed", error: error.message });
  }
};
