import { Request, Response, NextFunction } from "express";
import { Drug } from "../models/Drug.js";
import { Prescription } from "../models/Prescription.js";
import { Types } from "mongoose";

export const searchDrugs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const q = req.query.q as string;
    const queryStr = q ? q.trim() : "";

    let filter: any = { isActive: true };
    if (queryStr) {
      filter.$or = [
        { name: { $regex: queryStr, $options: "i" } },
        { genericName: { $regex: queryStr, $options: "i" } },
      ];
    }

    const drugs = await Drug.find(filter).limit(30);

    res.status(200).json(
      drugs.map((d) => ({
        id: d._id.toString(),
        name: d.name,
        genericName: d.genericName,
        form: d.form,
        defaultDosage: d.defaultDosage,
        commonUnits: d.commonUnits,
      }))
    );
  } catch (error) {
    next(error);
  }
};

export const getPublicPrescription = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    let prescription = null;
    if (Types.ObjectId.isValid(id)) {
      prescription = await Prescription.findById(id)
        .populate("clinicId", "name phone address")
        .populate("doctorId", "name specialty")
        .populate("patientId", "name age gender");
    } else {
      prescription = await Prescription.findOne({
        $or: [{ qrHash: id }, { prescriptionNumber: id }],
      })
        .populate("clinicId", "name phone address")
        .populate("doctorId", "name specialty")
        .populate("patientId", "name age gender");
    }

    if (!prescription) {
      res.status(404).json({
        success: false,
        error: { message: "Prescription not found or invalid verification code" },
      });
      return;
    }

    res.status(200).json({
      success: true,
      prescriptionNumber: prescription.prescriptionNumber,
      date: prescription.createdAt.toISOString().split("T")[0],
      clinic: prescription.clinicId,
      doctor: prescription.doctorId,
      patient: prescription.patientId,
      diagnosis: prescription.diagnosis,
      drugs: prescription.drugs,
      notes: prescription.notes,
      verified: true,
    });
  } catch (error) {
    next(error);
  }
};
