import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/jwt";
import crypto from "crypto";
import { getTokenFromRequest, verifyToken } from "@/lib/jwt";
// POST /api/upload/signature
// Returns a Cloudinary signature for direct client-side uploads
// This keeps the API secret on the server while letting clients upload directly

var CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
var API_KEY = process.env.CLOUDINARY_API_KEY;
var API_SECRET = process.env.CLOUDINARY_API_SECRET;

function generateSignature(params, secret) {
  // Cloudinary requires params sorted alphabetically, joined with &
  var sorted = Object.keys(params)
    .sort()
    .map(function (k) {
      return k + "=" + params[k];
    })
    .join("&");
  return crypto
    .createHash("sha256")
    .update(sorted + secret)
    .digest("hex");
}

export async function POST(req) {
  var body = await req.json();
  try {
    var userId = await getAuthUser(req);
 
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
      return NextResponse.json(
        { error: "Cloudinary not configured" },
        { status: 500 },
      );
    }

    var folder = body.folder || "staff-arts";
    var resourceType = body.resourceType || "image"; // image | video | raw
    var transformation = body.transformation || null;

    var timestamp = Math.floor(Date.now() / 1000);

    // Build params to sign
    var params = {
      timestamp: timestamp,
      folder: folder,
      upload_preset: body.uploadPreset || undefined,
    };

    // Add optional params
    if (body.publicId) params.public_id = body.publicId;
    if (body.tags) params.tags = body.tags;
    if (body.context) params.context = body.context;
    if (transformation) params.transformation = transformation;
    if (body.eager) params.eager = body.eager;
    if (body.overwrite) params.overwrite = "true";
    if (body.invalidate) params.invalidate = "true";

    // Remove undefined values
    Object.keys(params).forEach(function (k) {
      if (params[k] === undefined) delete params[k];
    });

    var signature = generateSignature(params, API_SECRET);

    return NextResponse.json({
      data: {
        signature: signature,
        timestamp: timestamp,
        cloudName: CLOUD_NAME,
        apiKey: API_KEY,
        folder: folder,
        resourceType: resourceType,
        uploadUrl:
          "https://api.cloudinary.com/v1_1/" +
          CLOUD_NAME +
          "/" +
          resourceType +
          "/upload",
      },
    });
  } catch (err) {
    console.error("Signature error:", err);
    return NextResponse.json(
      { error: "Failed to generate signature" },
      { status: 500 },
    );
  }
}
