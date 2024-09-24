import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import UserModel from "../Modals/UserModal.js";

// Get __dirname equivalent in ES6 module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the root `uploads` folder (relative to the root of the project)
const uploadsDir = path.join(process.cwd(), "uploads");

export const onGetPDF = async (req, res) => {
  try {
    const user = await UserModel.findOne({ mobile: req.params.mobile });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create a PDF document
    const doc = new PDFDocument();
    
    // Generate a unique file name using timestamp (Date.now())
    const fileName = `${Date.now()}.pdf`;

    // Store the PDF in the root uploads folder
    const pdfPath = path.join(uploadsDir, fileName);
    const pdfStream = fs.createWriteStream(pdfPath);
    doc.pipe(pdfStream);

    // Customize the PDF content
    doc
      .fontSize(25)
      .text("User Profile", { align: "center" })
      .moveDown()
      .fontSize(18)
      .text(`Name: ${user.name}`)
      .text(`Email: ${user.mobile}`)
      .text(`Gender: ${user.gender}`);

    doc.end();

    // On PDF stream finish, send the response
    pdfStream.on("finish", () => {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileName}"`
      );

      // Send JSON and PDF URL in the response
      res.status(200).json({
        message: "PDF generated and data sent",
        pdfUrl: `/uploads/${fileName}`,
        user,
      });
    });
  } catch (error) {
    console.log({ error: error.message, message: "pdf generation failed" });
    return res
      .status(500)
      .json({ message: "pdf generation failed", error: error.message });
  }
};
