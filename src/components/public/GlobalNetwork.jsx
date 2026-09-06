import { useState } from "react";
import styles from "./GlobalNetwork.module.css";

// 공개 페이지의 국가명과 수치를 보존한다. 위치는 지리가 아닌 연결 도식용이다.
const countries = [
  { key: "usa", label: "U.S.A.", count: 1 },
  { key: "qatar", label: "Qatar", count: 1 },
  { key: "vietnam", label: "Vietnam", count: 4 },
  { key: "poland", label: "Poland", count: 1 },
  { key: "indonesia", label: "Indonesia", count: 3 },
  { key: "australia", label: "Australia", count: 1 },
  { key: "uzbekistan", label: "Uzbekistan", count: 8 },
  { key: "singapore", label: "Singapore", count: 1 },
];

export function GlobalNetwork({ language }) {
  const [selected, setSelected] = useState(countries[0].key);

  return (
    <div className={styles.network}>
      <div className={styles.diagram}>
        {/* 해외 국가명과 개수는 아래 버튼 목록에서 한 번만 읽힌다. */}
        <svg viewBox="0 0 640 400" focusable="false" aria-hidden="true">
          <circle cx="320" cy="200" r="146" className={styles.orbit} />
          <circle cx="320" cy="200" r="105" className={styles.orbit} />
          {countries.map((country, index) => {
            const left = index < 4;
            const x = left ? 128 : 512;
            const y = 56 + (index % 4) * 96;
            const active = selected === country.key;

            return (
              <g
                key={country.key}
                data-country={country.key}
                data-active={active}
                className={styles.branch}
              >
                <path
                  d={`M 320 200 C ${left ? 218 : 422} 200, ${left ? 230 : 410} ${y}, ${x} ${y}`}
                  className={styles.connection}
                />
                <circle
                  cx={x}
                  cy={y}
                  r={active ? 7 : 4}
                  className={styles.node}
                />
                {active && (
                  <circle cx={x} cy={y} r="13" className={styles.nodeRing} />
                )}
                <text
                  x={left ? x - 19 : x + 19}
                  y={y + 5}
                  textAnchor={left ? "end" : "start"}
                  className={styles.countryLabel}
                >
                  {country.label}
                </text>
              </g>
            );
          })}
          <circle cx="320" cy="200" r="60" className={styles.hub} />
          <circle cx="320" cy="200" r="49" className={styles.hubInner} />
          <text x="320" y="205" textAnchor="middle" className={styles.hubLabel}>
            BRAINWORKS
          </text>
        </svg>
        {/* 원본 국·영문 지도에 기재된 국내 네트워크 수치와 표현을 보존한다. */}
        <p className={styles.domesticNetwork}>
          {language === "ko" ? "Korea 10개사" : "Korea 10 company"}
        </p>
      </div>
      <ul
        className={styles.countries}
        aria-label={
          language === "ko"
            ? "글로벌 네트워크 국가"
            : "Global network countries"
        }
      >
        {countries.map((country) => (
          <li key={country.key}>
            <button
              type="button"
              aria-label={`${country.label} ${country.count}`}
              aria-pressed={selected === country.key}
              onClick={() => setSelected(country.key)}
              className={styles.country}
            >
              <span className={styles.selectionMark} aria-hidden="true" />
              <span>{country.label}</span>
              <span className={styles.count}>{country.count}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
