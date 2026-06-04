import { NextRequest } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import Contact from "../../../lib/models/Contact";

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, message } = await request.json();

    if (!name?.trim() || !email?.trim() || !phone?.trim() || !message?.trim()) {
      return Response.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    await connectDB();
    const contact = await Contact.create({ name, email, phone, message });

    return Response.json(
      { message: "Thank you! We'll get back to you soon.", contact },
      { status: 201 }
    );
  } catch (err) {
    console.error("[contact POST]", err);
    return Response.json({ error: "Failed to send message." }, { status: 500 });
  }
}
