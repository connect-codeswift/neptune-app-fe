import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import {
  findHazcomSdsRecord,
  type HazcomChemical,
} from "@/components/hazcom/shared";
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

const signalWordBorderClass: Record<"danger" | "warn", string> = {
  danger: "border-ehs-red text-ehs-red",
  warn: "border-ehs-yellow text-ehs-yellow",
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
  const sdsRecord = chemical.sdsRecordId
    ? findHazcomSdsRecord(chemical.sdsRecordId)
    : undefined;
  const manufacturer = sdsRecord?.manufacturer ?? "Not on file";
  const signalTone = hazcomSignalWordTone(chemical.signalWord);
  const hasExtras = includeBarcode || includeQrCode;
  const noteToShow = internalNote.trim().length > 0 ? internalNote : null;

  return (
    <div
      style={{ aspectRatio: `${size.widthIn} / ${size.heightIn}` }}
      className={[
        "border-ehs-darker/80 mx-auto flex w-full max-w-[420px] flex-col gap-3 overflow-y-auto rounded-lg border-2 bg-white p-5 shadow-sm",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <Text as="h3" className="text-ehs-darker text-lg leading-tight font-bold">
            {chemical.name}
          </Text>
          <Text as="p" className="text-ehs-muted-text text-xs">
            {`CAS: ${chemical.casNumber} · ${chemical.hazardClass}`}
          </Text>
        </div>
        <span
          className={[
            "shrink-0 rounded-md border-2 px-3 py-1 text-sm font-extrabold tracking-wide uppercase",
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
              className="border-ehs-darker/70 flex size-10 shrink-0 items-center justify-center rounded-md border-2"
            >
              <Icon
                icon={HAZCOM_LABEL_PICTOGRAM_ICON[pictogram]}
                className="text-ehs-darker size-5"
                aria-hidden="true"
              />
              <span className="sr-only">{pictogram}</span>
            </span>
          ))}
        </div>
      ) : null}

      {chemical.hazardStatements.length > 0 ? (
        <p className="text-ehs-darker text-xs leading-relaxed">
          <span className="font-bold">Hazard: </span>
          {chemical.hazardStatements
            .map((statement) => `${statement.code} – ${statement.text}`)
            .join(" ")}
        </p>
      ) : null}

      {chemical.precautionaryStatements.length > 0 ? (
        <p className="text-ehs-darker text-xs leading-relaxed">
          <span className="font-bold">Precaution: </span>
          {chemical.precautionaryStatements
            .map((statement) => `${statement.code} – ${statement.text}`)
            .join(" ")}
        </p>
      ) : null}

      <Text as="p" className="text-ehs-muted-text text-[11px]">
        {`Manufacturer: ${manufacturer} · Emergency: ${HAZCOM_LABEL_EMERGENCY_PHONE}`}
      </Text>

      <Text
        as="p"
        className={[
          "text-[11px] italic",
          noteToShow ? "text-ehs-gray" : "text-ehs-muted-text/70",
        ].join(" ")}
      >
        {noteToShow ?? "Something for internal use only got it?"}
      </Text>

      {hasExtras ? (
        <div className="border-ehs-border mt-auto flex items-center justify-center gap-6 border-t pt-3">
          {includeBarcode ? (
            <div className="flex flex-col items-center gap-1">
              <div
                aria-hidden="true"
                className="h-8 w-32 bg-[repeating-linear-gradient(90deg,#0b1320_0px,#0b1320_2px,transparent_2px,transparent_5px)]"
              />
              <Text
                as="span"
                className="text-ehs-gray text-[11px] font-bold tracking-widest"
              >
                {chemical.id}
              </Text>
            </div>
          ) : null}

          {includeQrCode ? (
            <div
              role="img"
              aria-label={`QR code placeholder for ${chemical.id}`}
              className="grid size-16 shrink-0 grid-cols-5 grid-rows-5 gap-[1px] border border-[#0b1320] bg-white p-1"
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
