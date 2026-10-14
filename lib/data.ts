export const fields = [
  "기간",
  "역할",
  "문제",
  "과정",
  "결과",
  "증빙",
  "회고",
] as const;
export type RecordField = (typeof fields)[number];
export type Material = {
  id: string;
  title: string;
  kind: "text" | "link" | "file";
  text: string;
  url?: string;
  date: string;
  sample?: boolean;
};
export type Project = {
  id: string;
  title: string;
  start: string;
  end: string;
  status: "진행 중" | "완료";
  description: string;
  role: string;
  problem: string;
  process: string;
  result: string;
  reflection: string;
  interests: string[];
  materials: Material[];
};
export type Portfolio = {
  id: string;
  title: string;
  template: string;
  order: string[];
  contents: Record<
    string,
    { problem: string; process: string; result: string; organization?: string }
  >;
  updated: string;
  checklist: boolean[];
};
export type Store = { projects: Project[]; portfolios: Portfolio[] };
export function recordState(p: Project): Record<RecordField, boolean> {
  return {
    기간: !!(p.start && p.end),
    역할: !!p.role,
    문제: !!p.problem,
    과정: !!p.process,
    결과: !!p.result,
    증빙: p.materials.length > 0,
    회고: !!p.reflection,
  };
}
const material = (
  id: string,
  title: string,
  text: string,
  kind: Material["kind"] = "text",
): Material => ({ id, title, text, kind, date: "2026-04-12", sample: true });
export function seed(): Store {
  return {
    portfolios: [],
    projects: [
      {
        id: "access",
        title: "상점 접근성 개선 프로젝트",
        start: "2026-03-02",
        end: "2026-05-29",
        status: "완료",
        description:
          "누구나 편하게 방문할 수 있는 상점의 접근성 안내 지도를 만들었습니다.",
        role: "현장 조사 · 인터뷰 · 지도 시안",
        problem:
          "가게의 출입구와 통로 정보를 방문 전에 알기 어려웠습니다. 휠체어 사용자, 유모차 동반 가족, 고령자 등 모두가 편리하게 이용할 수 있는 정보를 제공하고 싶었습니다.",
        process:
          "상점을 직접 살피고 인터뷰를 정리해, 접근성 안내 지도의 항목을 구성했습니다. 가게 사장님들과 대화하며 필요한 정보를 파악하고, 실제 이용자의 관점에서 지도를 제작했습니다.",
        result:
          "접근성 안내 지도 시안을 완성하고, 지역 상점 5곳의 정보를 담았습니다.",
        reflection:
          "사용자 관점에서 정보를 모으는 법을 배웠습니다. 다음에는 지도를 직접 사용한 사람들의 반응을 기록하고 싶습니다.",
        interests: ["접근성", "사용자 경험", "지역 문제"],
        materials: [
          material(
            "interview",
            "인터뷰 기록.pdf",
            "출입구와 통로를 관찰하고 상점 운영자와 인터뷰했습니다. 현장 조사와 인터뷰 정리는 제가 맡았습니다.",
          ),
          material(
            "photo",
            "현장 사진.jpg",
            "데모 자료: 실제 이미지 파일은 첨부되어 있지 않습니다.",
            "file",
          ),
          material(
            "minutes",
            "프로젝트 회의록",
            "관찰 → 문제 정리 → 개선안. 인터뷰 결과를 지도 시안 항목에 반영하기로 했습니다.",
          ),
        ],
      },
      {
        id: "space",
        title: "학교 공간 개선",
        start: "2026-05-04",
        end: "2026-06-26",
        status: "완료",
        description:
          "학교 공간을 관찰하고 이동 중 불편을 줄일 개선안을 정리했습니다.",
        role: "공간 관찰 · 문제 정리",
        problem: "학교 공간을 이동할 때 불편한 지점이 있었습니다.",
        process: "공간 이용을 관찰하고 인터뷰를 정리해 개선안을 제안했습니다.",
        result: "공간 개선안을 정리했습니다.",
        reflection: "",
        interests: ["접근성", "사용자 경험"],
        materials: [
          material(
            "space-note",
            "공간 이용 관찰 노트",
            "관찰 → 문제 정리 → 개선안. 공간 이용을 관찰하고 이동 중 불편한 지점을 정리했습니다.",
          ),
          material(
            "space-plan",
            "공간 개선안",
            "조사한 내용을 바탕으로 공간 개선안을 제안했습니다.",
          ),
        ],
      },
      {
        id: "map",
        title: "지역 쓰레기 지도 만들기",
        start: "2026-06-01",
        end: "",
        status: "진행 중",
        description: "지역의 쓰레기 문제를 조사하고 있습니다.",
        role: "지역 관찰",
        problem: "지역 쓰레기 발생 지점을 확인하고 싶었습니다.",
        process: "현장을 관찰하고 기록을 모으고 있습니다.",
        result: "",
        reflection: "",
        interests: ["지역 문제"],
        materials: [
          material(
            "map-note",
            "지역 관찰 기록",
            "지역을 걸으며 쓰레기가 발생하는 위치를 기록했습니다.",
          ),
        ],
      },
    ],
  };
}
export const emptyStore: Store = { projects: [], portfolios: [] };
