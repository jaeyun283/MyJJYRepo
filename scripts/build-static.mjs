import { mkdtemp, cp, symlink, mkdir, rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
const root = process.cwd();
const temporary = await mkdtemp(path.join(tmpdir(), "record-static-"));
try {
  for (const entry of [
    "app",
    "components",
    "lib",
    "package.json",
    "tsconfig.json",
    "next-env.d.ts",
    "next.config.ts",
  ]) {
    await cp(path.join(root, entry), path.join(temporary, entry), {
      recursive: true,
      filter: (source) => !source.startsWith(path.join(root, "app", "api")),
    });
  }
  await symlink(
    path.join(root, "node_modules"),
    path.join(temporary, "node_modules"),
    "dir",
  );
  const result = spawnSync(
    process.execPath,
    [path.join(root, "node_modules/next/dist/bin/next"), "build", "--webpack"],
    {
      cwd: temporary,
      stdio: "inherit",
      env: {
        ...process.env,
        NEXT_PUBLIC_STATIC_DEMO: "true",
        RECORD_BASE_PATH: process.env.RECORD_BASE_PATH || "/MyJJYRepo",
      },
    },
  );
  if (result.status !== 0) process.exitCode = result.status || 1;
  else {
    const output = path.join(root, "out");
    await rm(output, { recursive: true, force: true });
    await mkdir(output, { recursive: true });
    await cp(path.join(temporary, "out"), output, { recursive: true });
    console.log(
      "Static demo ready in out/. No server API routes or credentials included.",
    );
  }
} finally {
  await rm(temporary, { recursive: true, force: true });
}
