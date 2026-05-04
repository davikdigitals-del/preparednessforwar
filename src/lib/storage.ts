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
    if (error.message?.includes("Bucket not found") || error.message?.includes("bucket")) {
      throw new Error(
        'Storage bucket "content-files" does not exist. Run STORAGE_SETUP.sql in your Supabase SQL Editor first.'
      );
    }
    if (error.message?.includes("policy") || error.message?.includes("not authorized")) {
      throw new Error(
        "Upload not authorized. Run STORAGE_SETUP.sql to set up storage policies."
      );
    }
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from("content-files").getPublicUrl(path);
  return { url: data.publicUrl, path };
}
