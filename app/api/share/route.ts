// app/api/share/route.ts
import sgMail from "@sendgrid/mail";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Document, Packer, Paragraph } from "docx"; // Import for .docx generation

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { summary, recipients } = await req.json();

  // Generate .docx buffer
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: "Meeting Summary",
            heading: "Heading1",
          }),
          new Paragraph({
            text: summary,
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc); // Generate buffer for attachment
  const base64Doc = buffer.toString("base64"); // Encode as base64 for SendGrid

  const msg = {
    to: recipients, // Array for multiple recipients
    from: process.env.SENDGRID_FROM_EMAIL!,
    subject: "Meeting Summary",
    text: "Please find the meeting summary attached as a DOCX file.", // Simple body text
    attachments: [
      {
        content: base64Doc,
        filename: "meeting-summary.docx",
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        disposition: "attachment",
      },
    ],
  };

  await sgMail.sendMultiple(msg); // Send with attachment
  return NextResponse.json({ success: true });
}
