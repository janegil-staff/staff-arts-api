import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { getAuthUser } from "@/lib/jwt";

// POST /api/upload
// Returns signed params so the Expo app can upload directly to Cloudinary.
// This keeps the API secret safe on the server while the device uploads
// straight to Cloudinary's CDN — no file proxying through your server.

export async function POST(req) {
  console.log("UPLOAD");
    const body = await req.json();
     console.log("BODY ----> ", body);
  try {
    // Auth check
    const auth = await getAuthUser(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

  
    const folder = body.folder || "staffarts";

    // Timestamp (Cloudinary requires seconds, not ms)
    const timestamp = Math.round(Date.now() / 1000);

    // Params to sign — add any upload options you want locked server-side
    const paramsToSign = {
      timestamp,
      folder,
      // Optional: enforce transformations, tags, etc.
      // transformation: "c_limit,w_2000,h_2000,q_auto",
    };

    // Generate signature
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    );

    return NextResponse.json({
      success: true,
      data: {
        signature,
        timestamp,
        folder,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        // The Expo app uses these to POST directly to Cloudinary
        uploadUrl: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
      },
    });
  } catch (err) {
    console.error("Upload sign error:", err);
    return NextResponse.json({ success: false, error: "Failed to sign upload" }, { status: 500 });
  }
}
