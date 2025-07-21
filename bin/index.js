#!/usr/bin/env node

import prompts from 'prompts';
import degit from 'degit';
import { execSync } from 'child_process';
import { existsSync } from 'fs';

const main = async () => {
  const { projectName } = await prompts({
    type: 'text',
    name: 'projectName',
    message: '프로젝트 이름을 입력하세요:',
    initial: 'my-app'
  });

  if (!projectName) {
    console.error('❌ 프로젝트 이름을 입력해야 합니다.');
    process.exit(1);
  }

  // 현재 디렉토리에 설치할 경우
  const isCurrentDir = projectName === '.' || projectName === './';

  // 이름 검증
  if (!isCurrentDir && !/^[a-zA-Z0-9-_]+$/.test(projectName)) {
    console.error("❌ 프로젝트 이름은 영문, 숫자, '-', '_'만 사용할 수 있습니다.");
    process.exit(1);
  }

  // 현재 디렉토리 설치 + .git 존재 → 경고
  if (isCurrentDir && existsSync('.git')) {
    const { confirm } = await prompts({
      type: 'confirm',
      name: 'confirm',
      message: '현재 폴더는 Git 저장소입니다. 덮어쓰면 문제가 생길 수 있습니다. 계속할까요?',
      initial: false
    });

    if (!confirm) {
      console.log('⛔️ 작업을 취소했습니다.');
      process.exit(1);
    }
  }

  const emitter = degit('cher1shRXD/cher1sh-next-app', {
    cache: false,
    force: true,
    verbose: true
  });

  try {
    console.log(`🚀 템플릿을 ${projectName}에 복사 중...`);
    await emitter.clone(projectName);
  } catch (err) {
    console.error('❌ 템플릿 복사 실패:', err);
    process.exit(1);
  }

  try {
    console.log('📦 패키지 설치 중...');
    execSync(`cd ${projectName} && pnpm install`, { stdio: 'inherit' });
  } catch (err) {
    console.error('❌ 패키지 설치 실패:', err);
    process.exit(1);
  }

  const nextStep = isCurrentDir ? '' : `\n👉 cd ${projectName}`;
  console.log(`
🎉 프로젝트 생성 완료!

${nextStep}
👉 pnpm dev

Happy hacking!
`);
};

main().catch((err) => {
  console.error('❌ 예기치 못한 오류 발생:', err);
  process.exit(1);
});
