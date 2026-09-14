const DATE_FORMAT_OPTIONS = {
  year: 'numeric',
  month: 'short',
  day: '2-digit',
};

const KO_FORMATTER = new Intl.DateTimeFormat('ko-KR', DATE_FORMAT_OPTIONS);
const EN_FORMATTER = new Intl.DateTimeFormat('en-US', DATE_FORMAT_OPTIONS);

export function formatDate(dateString, language) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return dateString;
  }
  return (language === 'ko' ? KO_FORMATTER : EN_FORMATTER).format(date);
}
