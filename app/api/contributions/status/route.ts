import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/user";
import Request from "@/lib/models/requests";
import { sendMail } from "@/lib/sendMail";
import Contributors from "@/lib/models/contibutors";

interface FileDocument {
  fileId: string;
  status: string;
  rejectionComment?: string;
  contributedBy: string;
}

interface DocumentItem {
  id: string;
  files: FileDocument[];
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const {
      contributionId,
      status,
      rejectionComment,
      isRequestContribution,
      requestId,
      documentId,
      sendEmail, // NEW
      adminComment, // NEW
    } = await request.json();

    if (isRequestContribution) {
      // Update request contribution
      const requestDoc = await Request.findById(requestId);
      if (!requestDoc) {
        return NextResponse.json(
          { error: "Request not found" },
          { status: 404 }
        );
      }

      const document = requestDoc.documents.id(documentId);
      if (!document) {
        return NextResponse.json(
          { error: "Document not found" },
          { status: 404 }
        );
      }

      const file = document.files.id(contributionId);
      if (!file) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
      }

      file.status = status;
      if (rejectionComment) {
        file.rejectionComment = rejectionComment;
      }

      // Send email if approved or rejected and sendEmail is true
      if (sendEmail && (status === "approved" || status === "rejected")) {
        // Fetch the contributed user
        const contributedUser = await User.findOne({
          email: file.contributedBy,
        });
        const recipientName = contributedUser?.name || file.contributedBy;
        const fileName = file.fileName || "the contributed file";
        const previewLink =
          file.webViewLink || "https://rvce-utility.vercel.app";
        let subject = "";
        let html = "";
        let text = "";
        if (status === "approved") {
          subject = "[RVCE Utility] Your Contribution Has Been Accepted!";
          html = `
            <div style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 24px; border-radius: 8px; max-width: 600px; margin: auto;">
              <h2 style="color: #2d4a7a;">Your Contribution Has Been Accepted!</h2>
              <p>Hi <strong>${recipientName}</strong>,</p>
              <p>Your contribution <b>${fileName}</b> to a request on <b>RVCE Utility</b> has been <b>approved</b> by the admin!</p>
              <p>The file has been merged with the main files, you can find out the file in the respective folder.</p>
              <ul style="padding-left: 20px;">
                <li><b>File Name:</b> ${fileName}</li>
                <li><b>Status:</b> Approved</li>
                <li><b>Preview Link:</b> <a href="${previewLink}" target="_blank">View Resource</a></li>
              </ul>
              ${
                adminComment
                  ? `<div style='margin-top:16px;'><b>Admin Comment:</b><br/>${adminComment}</div>`
                  : ""
              }
              <div style="margin: 32px 0 16px 0; text-align: center;">
                <a href="https://rvce-utility.vercel.app/contributors" style="background: #2d4a7a; color: #fff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">Go to RVCE Utility</a>
              </div>
              <p style="margin-top: 24px;">Thank you for your valuable contribution.<br/>— The RVCE Utility Team</p>
            </div>
          `;
          text = `Hi ${recipientName},\n\nYour contribution \"${fileName}\" to a request on RVCE Utility has been approved by the admin!\n\nThe file has been merged with the main files, you can find out the file in the respective folder.\n\nFile Name: ${fileName}\nStatus: Approved\nPreview Link: ${previewLink}\n${
            adminComment ? `\nAdmin Comment: ${adminComment}\n` : ""
          }\nYou can visit RVCE Utility at: https://rvce-utility.vercel.app/contributors\n\nThank you for your valuable contribution.\n— The RVCE Utility Team`;
        } else if (status === "rejected") {
          subject = "[RVCE Utility] Your Contribution Has Been Rejected";
          html = `
            <div style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 24px; border-radius: 8px; max-width: 600px; margin: auto;">
              <h2 style="color: #b91c1c;">Your Contribution Has Been Rejected</h2>
              <p>Hi <strong>${recipientName}</strong>,</p>
              <p>Your contribution <b>${fileName}</b> to a request on <b>RVCE Utility</b> has been <b>rejected</b> by the admin.</p>
              <ul style="padding-left: 20px;">
                <li><b>File Name:</b> ${fileName}</li>
                <li><b>Status:</b> Rejected</li>
                <li><b>Preview Link:</b> <a href="${previewLink}" target="_blank">View Resource</a></li>
              </ul>
              ${
                adminComment
                  ? `<div style='margin-top:16px;'><b>Admin Comment:</b><br/>${adminComment}</div>`
                  : ""
              }
              <div style="margin: 32px 0 16px 0; text-align: center;">
                <a href="https://rvce-utility.vercel.app/contributors" style="background: #b91c1c; color: #fff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">Go to RVCE Utility</a>
              </div>
              <p style="margin-top: 24px;">If you have questions, please contact the admin.<br/>— The RVCE Utility Team</p>
            </div>
          `;
          text = `Hi ${recipientName},\n\nYour contribution \"${fileName}\" to a request on RVCE Utility has been rejected by the admin.\n\nFile Name: ${fileName}\nStatus: Rejected\nPreview Link: ${previewLink}\n${
            adminComment ? `\nAdmin Comment: ${adminComment}\n` : ""
          }\nYou can visit RVCE Utility at: https://rvce-utility.vercel.app/contributors\n\nIf you have questions, please contact the admin.\n— The RVCE Utility Team`;
        }
        await sendMail({
          to: file.contributedBy,
          subject,
          text,
          html,
        });
      }

      // Determine the overall status of the request based on file statuses
      const overallStatus = determineRequestStatus(requestDoc.documents);
      requestDoc.status = overallStatus;

      await requestDoc.save();

      // Also update in user's contribution array
      const user = await User.findOne({ email: file.contributedBy });
      if (user) {
        const userContribution = user.contribution.find(
          (c: any) => c.fileId === file.fileId
        );
        if (userContribution) {
          userContribution.status = status;
          if (rejectionComment) {
            userContribution.rejectionComment = rejectionComment;
          }
          await user.save();
        }
      }
    } else {
      // Update open contribution
      const user = await User.findOne({ "contribution._id": contributionId });
      if (!user) {
        return NextResponse.json(
          { error: "Contribution not found" },
          { status: 404 }
        );
      }

      const contribution = user.contribution.id(contributionId);
      if (!contribution) {
        return NextResponse.json(
          { error: "Contribution not found" },
          { status: 404 }
        );
      }

      contribution.status = status;
      if (rejectionComment) {
        contribution.rejectionComment = rejectionComment;
      }

      // Send email if approved or rejected and sendEmail is true
      if (sendEmail && (status === "approved" || status === "rejected")) {
        const recipientName = user.name || user.email;
        const fileName = contribution.fileName || "the contributed file";
        const previewLink =
          contribution.webViewLink || "https://rvce-utility.vercel.app";
        let subject = "";
        let html = "";
        let text = "";
        if (status === "approved") {
          subject = "[RVCE Utility] Your Contribution Has Been Accepted!";
          html = `
            <div style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 24px; border-radius: 8px; max-width: 600px; margin: auto;">
              <h2 style="color: #2d4a7a;">Your Contribution Has Been Accepted!</h2>
              <p>Hi <strong>${recipientName}</strong>,</p>
              <p>Your open contribution <b>${fileName}</b> on <b>RVCE Utility</b> has been <b>approved</b> by the admin!</p>
              <p>The file has been merged with the main files, you can find out the file in the respective folder.</p>
              <ul style="padding-left: 20px;">
                <li><b>File Name:</b> ${fileName}</li>
                <li><b>Status:</b> Approved</li>
                <li><b>Preview Link:</b> <a href="${previewLink}" target="_blank">View Resource</a></li>
              </ul>
              ${
                adminComment
                  ? `<div style='margin-top:16px;'><b>Admin Comment:</b><br/>${adminComment}</div>`
                  : ""
              }
              <div style="margin: 32px 0 16px 0; text-align: center;">
                <a href="https://rvce-utility.vercel.app/contributors" style="background: #2d4a7a; color: #fff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">Go to RVCE Utility</a>
              </div>
              <p style="margin-top: 24px;">Thank you for your valuable contribution.<br/>— The RVCE Utility Team</p>
            </div>
          `;
          text = `Hi ${recipientName},\n\nYour open contribution \"${fileName}\" on RVCE Utility has been approved by the admin!\n\nThe file has been merged with the main files, you can find out the file in the respective folder.\n\nFile Name: ${fileName}\nStatus: Approved\nPreview Link: ${previewLink}\n${
            adminComment ? `\nAdmin Comment: ${adminComment}\n` : ""
          }\nYou can visit RVCE Utility at: https://rvce-utility.vercel.app/contributors\n\nThank you for your valuable contribution.\n— The RVCE Utility Team`;
        } else if (status === "rejected") {
          subject = "[RVCE Utility] Your Contribution Has Been Rejected";
          html = `
            <div style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 24px; border-radius: 8px; max-width: 600px; margin: auto;">
              <h2 style="color: #b91c1c;">Your Contribution Has Been Rejected</h2>
              <p>Hi <strong>${recipientName}</strong>,</p>
              <p>Your open contribution <b>${fileName}</b> on <b>RVCE Utility</b> has been <b>rejected</b> by the admin.</p>
              <ul style="padding-left: 20px;">
                <li><b>File Name:</b> ${fileName}</li>
                <li><b>Status:</b> Rejected</li>
                <li><b>Preview Link:</b> <a href="${previewLink}" target="_blank">View Resource</a></li>
              </ul>
              ${
                adminComment
                  ? `<div style='margin-top:16px;'><b>Admin Comment:</b><br/>${adminComment}</div>`
                  : ""
              }
              <div style="margin: 32px 0 16px 0; text-align: center;">
                <a href="https://rvce-utility.vercel.app/contributors" style="background: #b91c1c; color: #fff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">Go to RVCE Utility</a>
              </div>
              <p style="margin-top: 24px;">If you have questions, please contact the admin.<br/>— The RVCE Utility Team</p>
            </div>
          `;
          text = `Hi ${recipientName},\n\nYour open contribution \"${fileName}\" on RVCE Utility has been rejected by the admin.\n\nFile Name: ${fileName}\nStatus: Rejected\nPreview Link: ${previewLink}\n${
            adminComment ? `\nAdmin Comment: ${adminComment}\n` : ""
          }\nYou can visit RVCE Utility at: https://rvce-utility.vercel.app/contributors\n\nIf you have questions, please contact the admin.\n— The RVCE Utility Team`;
        }
        await sendMail({
          to: user.email,
          subject,
          text,
          html,
        });
      }

      await user.save();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating contribution status:", error);
    return NextResponse.json(
      { error: "Failed to update contribution status" },
      { status: 500 }
    );
  }
}

function determineRequestStatus(documents: DocumentItem[]): string {
  const allFilesAccepted = documents.every((doc) =>
    doc.files.some((file) => file.status === "approved")
  );

  const allFilesReviewing = documents.every((doc) =>
    doc.files.some((file) => file.status === "reviewing")
  );

  if (allFilesAccepted) return "completed";
  if (allFilesReviewing) return "reviewing";
  return "pending"; // Default status
}
