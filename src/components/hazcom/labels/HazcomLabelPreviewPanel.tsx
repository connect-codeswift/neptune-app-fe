import { Text } from "@/components/Text";
import { HazcomGlassCard, type HazcomChemical } from "@/components/hazcom/shared";
import { HazcomGhsLabelCard } from "@/components/hazcom/labels/HazcomGhsLabelCard";
import {
  findHazcomLabelSize,
  type HazcomLabelSizeId,
} from "@/components/hazcom/labels/hazcom-label-constants";

export type HazcomLabelPreviewPanelProps = Readonly<{
  chemical: HazcomChemical;
  labelSizeId: HazcomLabelSizeId;
  includeBarcode: boolean;
  includeQrCode: boolean;
  internalNote: string;
  className?: string;
}>;

export function HazcomLabelPreviewPanel(
  props: Readonly<HazcomLabelPreviewPanelProps>,
) {
  const {
    chemical,
    labelSizeId,
    includeBarcode,
    includeQrCode,
    internalNote,
    className = "",
  } = props;

  const size = findHazcomLabelSize(labelSizeId);

  return (
    <HazcomGlassCard
      paddingClassName="p-8"
      className={["min-w-0 items-center justify-center", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex w-full flex-col items-center gap-6">
        <Text
          as="p"
          className="text-ehs-gray text-xs font-bold tracking-[0.08em]"
        >
          {`LIVE PREVIEW — ${size.previewLabel} LABEL`}
        </Text>

        <HazcomGhsLabelCard
          chemical={chemical}
          labelSizeId={labelSizeId}
          includeBarcode={includeBarcode}
          includeQrCode={includeQrCode}
          internalNote={internalNote}
        />
      </div>
    </HazcomGlassCard>
  );
}
