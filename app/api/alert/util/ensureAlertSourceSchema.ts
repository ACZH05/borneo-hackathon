import { Prisma } from "@prisma/client";

export function isMissingAlertSourceColumnError(error: unknown) {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2022") {
    return false;
  }

  const meta = error.meta as
    | {
        column?: unknown;
        driverAdapterError?: {
          cause?: {
            originalMessage?: unknown;
          };
        };
      }
    | undefined;

  const metaColumn =
    typeof meta?.column === "string" ? meta.column.toLowerCase() : "";
  const adapterMessage =
    typeof meta?.driverAdapterError?.cause?.originalMessage === "string"
      ? meta.driverAdapterError.cause.originalMessage.toLowerCase()
      : "";

  return metaColumn.includes("source") || adapterMessage.includes("alert.source");
}

export function formatPrismaDebugError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return {
      name: error.name,
      code: error.code,
      message: error.message,
      meta: error.meta ?? null,
    };
  }

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
    };
  }

  return {
    message: String(error),
  };
}

export async function ensureAlertSourceSchema(
  executeRawUnsafe: (query: string) => Promise<unknown>,
) {
  await executeRawUnsafe(`
    ALTER TABLE "Alert"
    ADD COLUMN IF NOT EXISTS "source" TEXT NOT NULL DEFAULT 'third_party_api';
  `);

  await executeRawUnsafe(`
    UPDATE "Alert"
    SET "source" = 'user_report'
    WHERE COALESCE("notes", '') = 'Generated via Aegis System';
  `);

  await executeRawUnsafe(`
    UPDATE "Alert"
    SET "source" = 'third_party_api'
    WHERE "source" IS NULL
       OR "source" NOT IN ('third_party_api', 'user_report');
  `);
}
