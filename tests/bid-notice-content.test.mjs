import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = process.cwd();

function readProjectFile(relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

test('bid notice data matches the uploaded Indonesia infrastructure bid notice', () => {
  const dataSource = readProjectFile('src/data/bidNotices.js');

  assert.match(dataSource, /indonesia-road-ai-infra-2026/);
  assert.match(
    dataSource,
    /국산 NPU 기반 온디바이스 AI 노면 진단 스마트 시티 솔루션 인도네시아 실증 인프라 구축 및 관리 대행/,
  );
  assert.match(dataSource, /브레인웍스 주식회사/);
  assert.match(dataSource, /금 156,430,000원 이내/);
  assert.match(dataSource, /2026-07-06/);
  assert.match(dataSource, /2026-07-17/);
  assert.match(dataSource, /kdh0401@brainworks\.co\.kr/);
  assert.match(dataSource, /010-5521-0401/);
});

test('bid notice detail page exposes downloadable bid notice and RFP files', () => {
  const dataSource = readProjectFile('src/data/bidNotices.js');
  const detailPage = readProjectFile('src/pages/bid-notice/[slug].jsx');

  const expectedDownloads = [
    {
      label: '입찰공고서',
      path: '/files/bid-notices/입찰공고문(인도네시아 실증 인프라 구축 및 관리 대행).hwpx',
      file: 'public/files/bid-notices/입찰공고문(인도네시아 실증 인프라 구축 및 관리 대행).hwpx',
    },
    {
      label: '제안요청서',
      path: '/files/bid-notices/제안요청서(인도네시아 실증 인프라 구축 및 관리 대행).hwpx',
      file: 'public/files/bid-notices/제안요청서(인도네시아 실증 인프라 구축 및 관리 대행).hwpx',
    },
  ];

  assert.match(dataSource, /attachments/);
  assert.match(detailPage, /notice\.attachments/);
  assert.match(detailPage, /download/);

  for (const item of expectedDownloads) {
    assert.match(dataSource, new RegExp(item.label));
    assert.ok(dataSource.includes(item.path), `${item.path} should be referenced`);
    assert.ok(existsSync(path.join(root, item.file)), `${item.file} should exist`);
  }
});

test('reannounced bid closes the original notice and uses the new schedule and recipients', () => {
  const dataSource = readProjectFile('src/data/bidNotices.js');
  const popupSource = readProjectFile('src/data/popups.js');
  const detailPage = readProjectFile('src/pages/bid-notice/[slug].jsx');

  assert.match(dataSource, /indonesia-road-ai-infra-reannouncement-2026/);
  assert.match(dataSource, /BW-BID-2026-002/);
  assert.match(dataSource, /재공고/);
  assert.match(dataSource, /ko: '마감'/);
  assert.match(dataSource, /2026-07-20/);
  assert.match(dataSource, /2026-07-24/);
  assert.match(dataSource, /kdh0401@brainworks\.co\.kr/);
  assert.match(dataSource, /austin@brainworks\.co\.kr/);
  assert.match(
    dataSource,
    /\/files\/bid-notices\/\[재공고\]입찰공고문\(인도네시아 실증 인프라 구축 및 관리 대행\)\.hwpx/,
  );
  assert.match(
    dataSource,
    /\/files\/bid-notices\/\[재공고\]제안요청서\(인도네시아 실증 인프라 구축 및 관리 대행\)\.hwpx/,
  );
  assert.match(popupSource, /재공고/);
  assert.match(detailPage, /notice\.emails/);

  const reannouncementFiles = [
    'public/files/bid-notices/[재공고]입찰공고문(인도네시아 실증 인프라 구축 및 관리 대행).hwpx',
    'public/files/bid-notices/[재공고]제안요청서(인도네시아 실증 인프라 구축 및 관리 대행).hwpx',
  ];

  for (const file of reannouncementFiles) {
    assert.ok(existsSync(path.join(root, file)), `${file} should exist`);
  }
});
