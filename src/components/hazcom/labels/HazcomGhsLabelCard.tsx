import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import type { HazcomChemical } from "@/components/hazcom/shared";
import {
  findHazcomLabelSize,
  HAZCOM_LABEL_EMERGENCY_PHONE,
  HAZCOM_LABEL_PICTOGRAM_ICON,
  HAZCOM_QR_GRID_SIZE,
  hazcomPseudoQrCells,
  hazcomSignalWordTone,
  type HazcomLabelSizeId,
} from "@/components/hazcom/labels/hazcom-label-constants";

export type HazcomGhsLabelCardProps = Readonly<{
  chemical: HazcomChemical;
  labelSizeId: HazcomLabelSizeId;
  includeBarcode: boolean;
  includeQrCode: boolean;
  internalNote: string;
  className?: string;
}>;

/**
 * Literal, like the rest of this sheet, and for the same reason.
 *
 * `--ehs-red` and `--ehs-yellow` lighten in the dark theme so they read against a near-black
 * ground. This label is always paper-white, so the lightened values would put a pale red
 * "DANGER" on white — the one word on a GHS label that must never be hard to read.
 * These are the light-theme values, pinned.
 */
const signalWordBorderClass: Record<"danger" | "warn", string> = {
  danger: "border-[#ef4444] text-[#ef4444]",
  warn: "border-[#f59e0b] text-[#f59e0b]",
};

export function HazcomGhsLabelCard(props: Readonly<HazcomGhsLabelCardProps>) {
  const {
    chemical,
    labelSizeId,
    includeBarcode,
    includeQrCode,
    internalNote,
    className = "",
  } = props;

  const size = findHazcomLabelSize(labelSizeId);
  /**
   * The manufacturer lives on the SDS record, and a chemical links to its
   * sheet by free text (`linkToSdsRecord`) rather than by id — so there is no
   * reliable join to follow until that field carries an id.
   */
  const manufacturer = "Not on file";
  const signalTone = hazcomSignalWordTone(chemical.signalWord);
  const hasExtras = includeBarcode || includeQrCode;
  const noteToShow = internalNote.trim().length > 0 ? internalNote : null;

  return (
    <div
      style={{ aspectRatio: `${size.widthIn} / ${size.heightIn}` }}
      className={[
        // Paper, not a card: this previews what comes out of a printer, and it
        // carries a barcode and a QR mark that only scan as dark-on-light. A
        // sheet that followed the app theme would show the user a label that
        // does not match the one they get, so it stays light in both themes.
        "border-ehs-paper-text/80 text-ehs-paper-text bg-ehs-paper mx-auto flex w-full max-w-105 flex-col gap-3 overflow-y-auto rounded-lg border-2 p-5 shadow-sm",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <Text as="h3" className="text3 text-ehs-paper-text leading-tight">
            {chemical.name}
          </Text>
          <Text as="p" className="text8 text-ehs-paper-muted">
            {`CAS: ${chemical.casNumber} · ${chemical.hazardClass}`}
          </Text>
        </div>
        <span
          className={[
            "text5 shrink-0 rounded-md border-2 px-3 py-1 tracking-wide uppercase",
            signalWordBorderClass[signalTone],
          ].join(" ")}
        >
          {chemical.signalWord}
        </span>
      </div>

      {chemical.pictograms.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {chemical.pictograms.map((pictogram) => (
            <span
              key={pictogram}
              title={pictogram}
              className="border-ehs-paper-text/70 flex size-10 shrink-0 items-center justify-center rounded-md border-2"
            >
              <Icon
                icon={HAZCOM_LABEL_PICTOGRAM_ICON[pictogram]}
                className="text-ehs-paper-text size-5"
                aria-hidden="true"
              />
              <span className="sr-only">{pictogram}</span>
            </span>
          ))}
        </div>
      ) : null}

      {chemical.hazardStatements.length > 0 ? (
        <p className="text8 text-ehs-paper-text leading-relaxed">
          <Text as="span" className="text7 text-ehs-paper-text">
            {"Hazard: "}
          </Text>
          {chemical.hazardStatements
            .map((statement) => `${statement.code} – ${statement.text}`)
            .join(" ")}
        </p>
      ) : null}

      {chemical.precautionaryStatements.length > 0 ? (
        <p className="text8 text-ehs-paper-text leading-relaxed">
          <Text as="span" className="text7 text-ehs-paper-text">
            {"Precaution: "}
          </Text>
          {chemical.precautionaryStatements
            .map((statement) => `${statement.code} – ${statement.text}`)
            .join(" ")}
        </p>
      ) : null}

      <Text as="p" className="text8 text-ehs-paper-muted">
        {`Manufacturer: ${manufacturer} · Emergency: ${HAZCOM_LABEL_EMERGENCY_PHONE}`}
      </Text>

      <Text
        as="p"
        className={[
          "text8 italic",
          noteToShow ? "text-ehs-paper-soft" : "text-ehs-paper-muted/70",
        ].join(" ")}
      >
        {noteToShow ?? "Something for internal use only got it?"}
      </Text>

      {hasExtras ? (
        <div className="border-ehs-paper-line mt-auto flex items-center justify-center gap-6 border-t pt-3">
          {includeBarcode ? (
            <div className="flex flex-col items-center gap-1">
              {/* Imitates a printed barcode, so it stays a literal #0b1320 on
                  white in both themes rather than following the theme tokens. */}
              <div
                aria-hidden="true"
                className="h-8 w-32 bg-[repeating-linear-gradient(90deg,#0b1320_0px,#0b1320_2px,transparent_2px,transparent_5px)]"
              />
              <Text
                as="span"
                className="text7 text-ehs-paper-soft tracking-widest"
              >
                {chemical.id}
              </Text>
            </div>
          ) : null}

          {/* Same as the barcode: a printed QR mark is always dark on white, and
              the sheet's dark is #0b1320, so these cells stay literal too. */}
          {includeQrCode ? (
            <div
              role="img"
              aria-label={`QR code placeholder for ${chemical.id}`}
              className="grid size-16 shrink-0 grid-cols-5 grid-rows-5 gap-0.25 border border-[#0b1320] bg-white p-1"
            >
              {hazcomPseudoQrCells(chemical.id).map((filled, index) => {
                const row = Math.floor(index / HAZCOM_QR_GRID_SIZE);
                const col = index % HAZCOM_QR_GRID_SIZE;
                const isFinderCell =
                  (row < 2 && col < 2) ||
                  (row < 2 && col > HAZCOM_QR_GRID_SIZE - 3) ||
                  (row > HAZCOM_QR_GRID_SIZE - 3 && col < 2);

                return (
                  <span
                    key={`qr-cell-${row}-${col}`}
                    className={
                      filled || isFinderCell ? "bg-[#0b1320]" : "bg-white"
                    }
                  />
                );
              })}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
