import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import type { HazcomChemical } from "@/components/hazcom/shared";
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
    <IncidentGlassCard
      paddingClassName="p-8"
      className={["min-w-0 items-center justify-center", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex w-full flex-col items-center gap-6">
        <Text
          as="p"
          className="text6 text-ehs-muted-text"
        >
          {`Live Preview — ${size.previewLabel} Label`}
        </Text>

        <HazcomGhsLabelCard
          chemical={chemical}
          labelSizeId={labelSizeId}
          includeBarcode={includeBarcode}
          includeQrCode={includeQrCode}
          internalNote={internalNote}
        />
      </div>
    </IncidentGlassCard>
  );
}
