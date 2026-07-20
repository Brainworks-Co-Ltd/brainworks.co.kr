import { getLatestBidNotice } from '@/data/bidNotices';

export function getActivePopups() {
  const latestBid = getLatestBidNotice();

  if (!latestBid) {
    return [];
  }

  return [
    {
      id: `bid-${latestBid.slug}`,
      type: 'bid',
      title: {
        ko: '공개경쟁입찰 재공고',
        en: 'Bid Reannouncement',
      },
      message: latestBid.popupMessage ?? latestBid.summary,
      ctaLabel: {
        ko: '재공고·첨부파일 확인',
        en: 'View Reannounced Bid',
      },
      href: `/bid-notice/${latestBid.slug}`,
      dismissKey: `brainworks-popup-${latestBid.slug}`,
      startsAt: latestBid.popupStartsAt ?? latestBid.postedAt,
      endsAt: latestBid.submissionEnd,
    },
  ];
}
