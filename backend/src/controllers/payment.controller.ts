import { Request, Response, NextFunction } from "express";
import { Booking } from "../models/Booking.js";
import { Queue } from "../models/Queue.js";
import { Types } from "mongoose";

export const handlePaymentWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { bookingId, transactionId, status, paymentMethod } = req.body;

    if (!bookingId || !Types.ObjectId.isValid(bookingId)) {
      res.status(400).json({ success: false, error: { message: "Invalid booking ID" } });
      return;
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      res.status(404).json({ success: false, error: { message: "Booking not found" } });
      return;
    }

    booking.paymentStatus = status === "success" ? "paid" : "failed";
    if (status === "success") {
      booking.status = "confirmed";
      if (booking.queueId) {
        await Queue.findByIdAndUpdate(booking.queueId, {
          notes: `حجز مدفوع إلكترونياً (${paymentMethod || "InstaPay"}) - Ref: ${transactionId || "N/A"}`,
        });
      }
    }

    await booking.save();

    res.status(200).json({
      success: true,
      message: `Payment status updated to ${booking.paymentStatus}`,
      bookingId: booking._id.toString(),
      paymentStatus: booking.paymentStatus,
    });
  } catch (error) {
    next(error);
  }
};

export const createPaymentIntent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { bookingId, amount, paymentMethod } = req.body;

    // Simulated InstaPay payment intent creation
    const reference = `INSTA-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    res.status(200).json({
      success: true,
      reference,
      amount: amount || 200,
      paymentMethod: paymentMethod || "instapay",
      instapayAddress: "clinic@instapay",
      expiresInMinutes: 15,
    });
  } catch (error) {
    next(error);
  }
};
