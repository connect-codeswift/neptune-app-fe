import type {
  CreateInspectionRequestDto,
  SaveInspectionResponsesRequestDto,
} from "@/dtos/req/inspection-request.dto";
import type {
  CreateInspectionResponseDto,
  GetAllInspectionsResponseDto,
  GetInspectionByIdResponseDto,
  SaveInspectionResponsesResponseDto,
} from "@/dtos/res/inspection-response.dto";
import http from "@/lib/axios";

const INSPECTION_PATH = "/Inspection";

export async function createInspection(payload: CreateInspectionRequestDto) {
  const { data } = await http.post<CreateInspectionResponseDto>(
    INSPECTION_PATH,
    payload,
  );
  return data;
}

export async function getAllInspections(
  params?: Readonly<{ pageNumber: number; pageSize: number; kind?: string }>,
) {
  const { data } = await http.get<GetAllInspectionsResponseDto>(
    INSPECTION_PATH,
    // The endpoint serves both kinds, so scope it to inspections by default.
    {
      params: {
        PageNumber: params?.pageNumber,
        PageSize: params?.pageSize,
        kind: params?.kind ?? "Inspection",
      },
    },
  );

  return data;
}

export async function saveInspectionResponses(
  inspectionId: string,
  payload: SaveInspectionResponsesRequestDto,
) {
  const { data } = await http.put<SaveInspectionResponsesResponseDto>(
    `${INSPECTION_PATH}/${encodeURIComponent(inspectionId)}/responses`,
    payload,
  );
  return data;
}

export async function getInspectionById(inspectionId: string) {
  const { data } = await http.get<GetInspectionByIdResponseDto>(
    `${INSPECTION_PATH}/${encodeURIComponent(inspectionId)}`,
  );
  console.log("Get inspection by id response", data);

  return data;
}
