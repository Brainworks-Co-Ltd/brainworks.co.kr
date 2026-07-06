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
        ko: '공개경쟁입찰 공고',
        en: 'Bid Notice',
      },
      message: latestBid.popupMessage ?? latestBid.summary,
      ctaLabel: {
        ko: '공고·첨부파일 확인',
        en: 'View Bid Notice',
      },
      href: `/bid-notice/${latestBid.slug}`,
      dismissKey: `brainworks-popup-${latestBid.slug}`,
      startsAt: latestBid.popupStartsAt ?? latestBid.postedAt,
      endsAt: latestBid.submissionEnd,
    },
  ];
}
