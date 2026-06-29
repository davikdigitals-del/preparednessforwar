import { supabase } from "@/integrations/supabase/client";

/** UUID v4 that works on HTTP, HTTPS, and all browsers */
function uuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function uploadContentFile(
  file: File,
  folder: "posts" | "library" | "media" | "misc" = "misc"
): Promise<{ url: string; path: string }> {
  const ext = file.name.includes(".") ? file.name.split(".").pop()?.toLowerCase() : "bin";
  const path = `${folder}/${uuid()}.${ext}`;

  const { error } = await supabase.storage
    .from("content-files")
    .upload(path, file, { upsert: false, cacheControl: "3600" });

  if (error) {
    console.error('Storage upload error:', error);
    
    if (error.message?.includes("Bucket not found") || error.message?.includes("bucket")) {
      throw new Error(
        'Storage bucket "content-files" does not exist. Run RUN_THIS_IN_SUPABASE.sql in your Supabase SQL Editor first.'
      );
    }
    if (error.message?.includes("policy") || error.message?.includes("not authorized")) {
      throw new Error(
        "Upload not authorized. Run RUN_THIS_IN_SUPABASE.sql to set up storage policies."
      );
    }
    if (error.message?.includes("file size")) {
      throw new Error(
        "File too large. Maximum size: 50MB for images, 100MB for videos."
      );
    }
    throw new Error(`Upload failed: ${error.message}`);
  }

  // Get public URL for uploaded file
  const { data: urlData } = supabase.storage
    .from("content-files")
    .getPublicUrl(path);

  if (!urlData?.publicUrl) {
    throw new Error("Failed to get public URL for uploaded file");
  }

  return { 
    url: urlData.publicUrl, 
    path,
  };

  const { data } = supabase.storage.from("content-files").getPublicUrl(path);
  return { url: data.publicUrl, path };
}
