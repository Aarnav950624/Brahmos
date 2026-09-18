import { ApiError } from "@/api/client";
import { extractMedicineFromImage } from "@/services/ai.service";

import {
  medicineExtractResultSchema,
  type MedicineExtractResult,
} from "./schema";
import type { PreparedImage } from "./prepare-image";

export class MedicineExtractError extends Error {
  readonly code: "unavailable" | "invalid" | "network";

  constructor(
    message: string,
    code: "unavailable" | "invalid" | "network",
  ) {
    super(message);
    this.name = "MedicineExtractError";
    this.code = code;
  }
}

export async function extractMedicineLabel(
  image: PreparedImage,
): Promise<MedicineExtractResult> {
  try {
    const raw = await extractMedicineFromImage({
      imageBase64: image.base64,
      mimeType: image.mimeType,
    });
    const parsed = medicineExtractResultSchema.safeParse(raw);
    if (!parsed.success) {
      throw new MedicineExtractError(
        "Could not understand the medicine scan response.",
        "invalid",
      );
    }
    return parsed.data;
  } catch (err) {
    if (err instanceof MedicineExtractError) throw err;
    if (err instanceof ApiError) {
      throw new MedicineExtractError(
        err.status === 503
          ? "Medicine scan service is unavailable. Enter the name manually."
          : err.message || "Medicine scan failed.",
        err.status >= 500 || err.status === 503 ? "unavailable" : "network",
      );
    }
    throw new MedicineExtractError(
      "Medicine scan failed. Enter the name manually.",
      "unavailable",
    );
  }
}
