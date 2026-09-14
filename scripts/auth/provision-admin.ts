import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { provisionAdminAccount } from "@/server/auth/provision-admin";
import { closeDb } from "@/server/db/client";

async function readSecret(prompt: string) {
  if (!stdin.isTTY || !stdout.isTTY) {
    throw new Error("관리자 계정 생성은 대화형 터미널에서 실행해 주세요.");
  }

  stdout.write(prompt);

  return new Promise<string>((resolve, reject) => {
    let value = "";
    const previousRawMode = stdin.isRaw;

    function cleanup() {
      stdin.removeListener("data", onData);
      stdin.setRawMode?.(previousRawMode ?? false);
      stdin.pause();
    }

    function onData(chunk: Buffer | string) {
      for (const character of chunk.toString()) {
        if (character === "\u0003") {
          cleanup();
          stdout.write("\n");
          reject(new Error("관리자 계정 생성을 취소했습니다."));
          return;
        }
        if (character === "\r" || character === "\n") {
          cleanup();
          stdout.write("\n");
          resolve(value);
          return;
        }
        if (character === "\u007f") {
          if (value.length > 0) {
            value = value.slice(0, -1);
            stdout.write("\b \b");
          }
          continue;
        }
        value += character;
      }
    }

    stdin.setRawMode(true);
    stdin.resume();
    stdin.on("data", onData);
  });
}

async function main() {
  if (!stdin.isTTY || !stdout.isTTY) {
    console.error("관리자 계정 생성은 대화형 터미널에서 실행해 주세요.");
    process.exitCode = 1;
    return;
  }

  const readline = createInterface({ input: stdin, output: stdout });

  try {
    const email = await readline.question("통합 관리자 이메일: ");
    const name = await readline.question("표시 이름: ");
    readline.close();

    const password = await readSecret("비밀번호: ");
    const passwordConfirmation = await readSecret("비밀번호 확인: ");
    const account = await provisionAdminAccount({
      email,
      name,
      password,
      passwordConfirmation,
    });

    console.log(`통합 관리자 계정을 생성했습니다: ${account.email}`);
    console.log("관리자 로그인 경로: /admin/auth/sign-in");
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "계정 생성에 실패했습니다.";
    console.error(message);
    process.exitCode = 1;
  } finally {
    readline.close();
    await closeDb();
  }
}

void main();
