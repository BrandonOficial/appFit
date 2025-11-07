import "react-native-url-polyfill/auto";
import { supabase } from "./config";
import { decode } from "base64-js";
import { Platform } from "react-native"; // 1. IMPORTAR O 'Platform'

// Importar a API 'legacy' SÓ se não estivermos na web
let readAsStringAsync;
if (Platform.OS !== "web") {
  readAsStringAsync = require("expo-file-system/legacy").readAsStringAsync;
}

/**
 * Faz o upload de um ficheiro (avatar) para o Supabase Storage.
 */
export const uploadAvatar = async (fileUri, userId) => {
  if (!fileUri || !userId) {
    return {
      data: null,
      error: new Error("URI do ficheiro e User ID são obrigatórios."),
    };
  }

  try {
    const fileExt = fileUri.split(".").pop() || "png";
    const filePath = `${userId}/${new Date().getTime()}.${fileExt}`;
    const contentType = `image/${fileExt === "jpg" ? "jpeg" : "png"}`;

    // --- 2. LÓGICA ESPECÍFICA DA PLATAFORMA ---

    if (Platform.OS === "web") {
      // --- CAMINHO DA WEB ---

      // 2a. O fileUri na web já é um data:base64 URI.
      // Precisamos de o converter num 'Blob' (ficheiro) que o 'upload' do Supabase entende.
      const response = await fetch(fileUri);
      const blob = await response.blob();

      // 3a. Fazer o upload do Blob
      const { data, error } = await supabase.storage
        .from("avatars")
        .upload(filePath, blob, {
          // O 'upload' na web prefere Blobs
          contentType,
          upsert: false,
        });

      if (error) throw error;
      return { data: { path: data.path }, error: null };
    } else {
      // --- CAMINHO NATIVO (iOS/Android) ---

      // 2b. Ler o ficheiro do disco (como estávamos a fazer)
      const base64 = await readAsStringAsync(fileUri, {
        encoding: "base64",
      });
      const arrayBuffer = decode(base64);

      // 3b. Fazer o upload do ArrayBuffer
      const { data, error } = await supabase.storage
        .from("avatars")
        .upload(filePath, arrayBuffer, {
          // O 'upload' nativo prefere ArrayBuffer
          contentType,
          upsert: false,
        });

      if (error) throw error;
      return { data: { path: data.path }, error: null };
    }
    // --- FIM DA LÓGICA ---
  } catch (e) {
    console.error("Erro inesperado em uploadAvatar:", e);
    return { data: null, error: e };
  }
};
