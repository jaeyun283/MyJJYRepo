import { test, expect, type Page } from "@playwright/test";
async function ready(page: Page) {
  await page.goto("/");
  await expect(page.locator(".loading")).toBeHidden();
}
async function demo(page: Page) {
  await ready(page);
  await page.getByRole("button", { name: "데모 모드 체험" }).click();
  await expect(
    page.getByRole("heading", {
      name: "상점 접근성 개선 프로젝트",
      exact: true,
    }),
  ).toBeVisible();
}
async function go(page: Page, name: string, width = 1440) {
  if (width === 390)
    await page.getByRole("button", { name: "메뉴 열기", exact: true }).click();
  await page.locator("nav").getByRole("button", { name, exact: true }).click();
}
test("개인 모드는 샘플 없음, 연결 필요, 데모 격리", async ({ page }) => {
  await ready(page);
  await expect(page.getByText("프로젝트 기록을 모아보세요")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "상점 접근성 개선 프로젝트" }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "새 프로젝트", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("연결");
  await page.getByRole("button", { name: "데모 모드 체험" }).click();
  await page.getByRole("button", { name: "데모 종료" }).click();
  await expect(page.getByText("프로젝트 기록을 모아보세요")).toBeVisible();
});
test("자료 등록·검색·편집·포트폴리오 저장 후 재열기", async ({ page }) => {
  await demo(page);
  await page.getByRole("button", { name: "링크 · 메모 추가" }).click();
  await page.getByLabel("자료 제목").fill("테스트 회의록");
  await page
    .getByLabel("기존 기록 또는 자유 메모")
    .fill("관찰과 인터뷰에서 맡은 역할을 정리했습니다.");
  await page.getByRole("button", { name: "데모 저장소에 저장" }).click();
  await expect(page.getByText("테스트 회의록", { exact: true })).toBeVisible();
  await page
    .getByLabel("파일 등록")
    .setInputFiles({
      name: "검증.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("원본 저장 테스트"),
    });
  await expect(page.getByText("검증.txt", { exact: true })).toBeVisible();
  await page.getByLabel("프로젝트, 키워드 검색").fill("학교");
  await expect(page.locator(".project-items .project-item")).toHaveCount(1);
  await page.getByRole("button", { name: "검색 지우기" }).click();
  await page.getByRole("tab", { name: "진행 기록", exact: true }).click();
  await page
    .getByLabel("내가 한 일과 과정")
    .fill("학생이 직접 수정한 과정입니다.");
  await page.getByRole("button", { name: "변경 내용 저장" }).click();
  await page.reload();
  await expect(page.locator(".loading")).toBeHidden();
  await page.getByRole("tab", { name: "진행 기록", exact: true }).click();
  await expect(page.getByLabel("내가 한 일과 과정")).toHaveValue(
    "학생이 직접 수정한 과정입니다.",
  );
  await go(page, "포트폴리오 만들기");
  await page.getByRole("button", { name: "이 서식으로 시작" }).click();
  await page.locator(".experience-option").nth(0).getByRole("checkbox").check();
  await page.locator(".experience-option").nth(1).getByRole("checkbox").check();
  await page.getByRole("button", { name: "기록으로 작성 시작" }).click();
  await page
    .locator(".draft-body textarea")
    .first()
    .fill("내 문장으로 수정한 문제");
  await page.getByRole("button", { name: "아래로", exact: true }).click();
  await page.getByRole("button", { name: "저장", exact: true }).click();
  await page.reload();
  await expect(page.locator(".loading")).toBeHidden();
  await page.locator(".saved-row > button").first().click();
  await expect(page.locator(".draft-body textarea").first()).toHaveValue(
    "학교 공간을 이동할 때 불편한 지점이 있었습니다.",
  );
  await page.locator(".order-item").nth(1).click();
  await expect(page.locator(".draft-body textarea").first()).toHaveValue(
    "내 문장으로 수정한 문제",
  );
  await page.getByRole("button", { name: "미리보기", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "내 문장으로 수정한 문제",
  );
});
test("그래프 근거 열기·미확인 태그·AI 전송 동의 및 연결 오류", async ({
  page,
  request,
}) => {
  await demo(page);
  await go(page, "나의 배움 정리");
  await page
    .getByRole("button", { name: "기록 인터뷰 기록.pdf", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText(
    "실제 학생 자료가 아닙니다",
  );
  await page.getByRole("button", { name: "닫기", exact: true }).click();
  await page.getByRole("tab", { name: "관심사·패턴", exact: true }).click();
  await expect(page.getByText("선택한 관심사와 연결된 경험 2개")).toBeVisible();
  await go(page, "AI 상담");
  await page.getByLabel("상담 질문").fill("어떤 근거가 필요한가요?");
  await page.getByRole("button", { name: "전송 내용 확인" }).click();
  await expect(
    page.getByRole("button", { name: "연결 확인 후 요청" }),
  ).toBeDisabled();
  await page.getByRole("checkbox", { name: /선택한 내용이 Gemini/ }).check();
  await page.getByRole("button", { name: "연결 확인 후 요청" }).click();
  await expect(page.locator(".error[role=alert]")).toContainText(
    "외부 AI에 전송하지 않았습니다",
  );
  const result = await request.post("/api/consultation", {
    data: { question: "질문", consent: false },
  });
  expect(result.status()).toBe(400);
  await go(page, "내 프로젝트");
  await page.locator(".project-item").last().click();
  await expect(page.locator(".check-block")).toContainText("미확인");
});
for (const width of [1440, 390])
  test(`${width}px 모든 화면 캡처·가로 넘침·콘솔 검증`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await demo(page);
    for (const [screen, name] of [
      ["projects", "내 프로젝트"],
      ["learning", "나의 배움 정리"],
      ["portfolio", "포트폴리오 만들기"],
      ["dashboard", "대시보드"],
      ["consultation", "AI 상담"],
      ["settings", "자료 연결 및 설정"],
    ]) {
      if (screen !== "projects") await go(page, name, width);
      await expect(page.locator("main h1")).toHaveText(name);
      if (screen === "settings")
        await expect(
          page.getByRole("button", { name: "연결 상태 다시 확인" }),
        ).toBeEnabled();
      await page.screenshot({
        path: `artifacts/${screen}-${width}.png`,
        fullPage: true,
        animations: "disabled",
      });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      if (screen === "learning") {
        await page.getByRole("tab", { name: "관심사·패턴" }).click();
        await page.screenshot({
          path: `artifacts/patterns-${width}.png`,
          fullPage: true,
          animations: "disabled",
        });
      }
      if (screen === "portfolio") {
        await page.getByRole("button", { name: "이 서식으로 시작" }).click();
        await page
          .locator(".experience-option")
          .first()
          .getByRole("checkbox")
          .check();
        await page.getByRole("button", { name: "기록으로 작성 시작" }).click();
        await page.screenshot({
          path: `artifacts/editor-${width}.png`,
          fullPage: true,
          animations: "disabled",
        });
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
      }
    }
    expect(errors).toEqual([]);
  });

test("대체서식·기관·체크리스트 저장과 모바일 상담 패널", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await demo(page);
  await go(page, "포트폴리오 만들기", 390);
  await page.locator(".template").nth(1).click();
  await page.getByRole("button", { name: "이 서식으로 시작" }).click();
  await page
    .locator(".experience-option")
    .first()
    .getByRole("checkbox")
    .check();
  await page.getByRole("button", { name: "기록으로 작성 시작" }).click();
  await page.getByLabel("활동(발행) 기관").fill("학생이 확인한 기관");
  await page
    .getByRole("checkbox", { name: "학교에 증빙서류 발급 요청" })
    .check();
  await page.getByRole("button", { name: "저장", exact: true }).click();
  await page.reload();
  await expect(page.locator(".loading")).toBeHidden();
  await page.locator(".saved-row > button").first().click();
  await expect(page.getByLabel("활동(발행) 기관")).toHaveValue(
    "학생이 확인한 기관",
  );
  await expect(
    page.getByRole("checkbox", { name: "학교에 증빙서류 발급 요청" }),
  ).toBeChecked();
  await page.screenshot({
    path: "artifacts/substitute-390.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.getByRole("button", { name: "AI와 이야기하기" }).click();
  await expect(page.locator(".consult-panel")).toBeVisible();
  await page
    .locator(".consult-panel")
    .getByLabel("상담 질문")
    .fill("이 경험을 정리하고 싶어요");
  await page.screenshot({
    path: "artifacts/consultation-panel-390.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.getByRole("button", { name: "상담 패널 닫기" }).click();
});
test("실제 파일 원본 재조회, 미지원 업로드와 네트워크 오류 상태", async ({
  page,
}) => {
  await demo(page);
  await page
    .getByLabel("파일 등록")
    .setInputFiles({
      name: "원본.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("원본 내용 보존"),
    });
  await expect(page.getByText("원본.txt", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.locator(".loading")).toBeHidden();
  await page
    .getByRole("button", { name: /원본.txt/ })
    .first()
    .click();
  const event = page.waitForEvent("download");
  await page.getByRole("link", { name: "원본 파일 다운로드" }).click();
  expect((await event).suggestedFilename()).toBe("원본.txt");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await page
    .getByLabel("파일 등록")
    .setInputFiles({
      name: "미지원.exe",
      mimeType: "application/octet-stream",
      buffer: Buffer.from("invalid"),
    });
  await expect(page.getByRole("status")).toContainText("파일을 지원합니다");
  await expect(page.getByText("미지원.exe", { exact: true })).toHaveCount(0);
  await page.route("**/api/connections", (route) => route.abort());
  await go(page, "자료 연결 및 설정");
  await expect(
    page.getByText("연결 설정을 확인하지 못했습니다. 다시 시도해 주세요."),
  ).toBeVisible();
  await page.screenshot({
    path: "artifacts/settings-error-1440.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.unroute("**/api/connections");
  await page.getByRole("button", { name: "연결 상태 다시 확인" }).click();
  await expect(page.getByText(/서버 키 미설정/)).toBeVisible();
});
test("일반 모드 빈 상태 화면 캡처", async ({ page }) => {
  await ready(page);
  await page.screenshot({
    path: "artifacts/projects-empty-1440.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.setViewportSize({ width: 390, height: 900 });
  await page.screenshot({
    path: "artifacts/projects-empty-390.png",
    fullPage: true,
    animations: "disabled",
  });
});
