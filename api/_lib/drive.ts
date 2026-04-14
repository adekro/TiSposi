import { google } from "googleapis";
import { PassThrough } from "stream";
import type { GalleryItem } from "../../src/types";

function getAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "Credenziali OAuth2 mancanti (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REFRESH_TOKEN)",
    );
  }
  const oauth2 = new google.auth.OAuth2(clientId, clientSecret);
  oauth2.setCredentials({ refresh_token: refreshToken });
  return oauth2;
}

function getDriveClient() {
  return google.drive({ version: "v3", auth: getAuthClient() });
}

export async function listDriveGalleryItems(folderId: string) {
  const drive = getDriveClient();
  const response = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: "files(id,name,mimeType,createdTime)",
    orderBy: "createdTime desc",
    pageSize: 200,
  });

  const files = response.data.files ?? [];
  const items: GalleryItem[] = [];

  for (const file of files) {
    if (!file.id || !file.name) continue;

    if (file.name.startsWith("dedica_") && file.mimeType === "text/plain") {
      const textRes = await drive.files.get(
        { fileId: file.id, alt: "media" },
        { responseType: "text" },
      );
      items.push({
        id: file.id,
        type: "dedica",
        text: String(textRes.data),
        timestamp: file.createdTime ?? new Date().toISOString(),
      });
      continue;
    }

    if (
      file.mimeType?.startsWith("image/") ||
      file.mimeType === "application/octet-stream"
    ) {
      items.push({
        id: file.id,
        type: "photo",
        url: `https://lh3.googleusercontent.com/d/${file.id}=w1200`,
        timestamp: file.createdTime ?? new Date().toISOString(),
      });
    }
  }

  return items;
}

export async function uploadDriveDedica(folderId: string, text: string) {
  const drive = getDriveClient();
  const filename = `dedica_${Date.now()}.txt`;
  const fileStream = new PassThrough();
  fileStream.end(Buffer.from(text, "utf8"));

  const uploaded = await drive.files.create({
    requestBody: {
      name: filename,
      parents: [folderId],
      mimeType: "text/plain",
    },
    media: { mimeType: "text/plain", body: fileStream },
    fields: "id,name,createdTime",
  });

  return {
    id: uploaded.data.id,
    name: uploaded.data.name,
    timestamp: uploaded.data.createdTime,
  };
}

export async function uploadDrivePhoto(
  folderId: string,
  contentType: string,
  rawBody: Buffer,
) {
  const drive = getDriveClient();
  const ext = contentType.split("/")[1].replace("jpeg", "jpg");
  const filename = `photo_${Date.now()}.${ext}`;
  const fileStream = new PassThrough();
  fileStream.end(rawBody);

  const uploaded = await drive.files.create({
    requestBody: {
      name: filename,
      parents: [folderId],
      mimeType: contentType,
    },
    media: { mimeType: contentType, body: fileStream },
    fields: "id,name,createdTime",
  });

  const fileId = uploaded.data.id;
  if (!fileId) {
    throw new Error("Upload Drive fallito: fileId mancante");
  }

  await drive.permissions.create({
    fileId,
    requestBody: { role: "reader", type: "anyone" },
  });

  return {
    id: fileId,
    name: uploaded.data.name,
    url: `https://lh3.googleusercontent.com/d/${fileId}=w1200`,
    timestamp: uploaded.data.createdTime,
  };
}
