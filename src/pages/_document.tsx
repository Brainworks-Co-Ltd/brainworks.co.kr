import { Html, Head, Main, NextScript } from "next/document";
import type { DocumentContext, DocumentProps } from "next/document";
import Document from "next/document";

type LocaleDocumentProps = DocumentProps & {
  __NEXT_DATA__?: { locale?: string };
};

export default class BrainworksDocument extends Document {
  static async getInitialProps(context: DocumentContext) {
    return Document.getInitialProps(context);
  }

  render() {
    const locale =
      (this.props as LocaleDocumentProps).__NEXT_DATA__?.locale === "en"
        ? "en"
        : "ko";

    // data-design은 서버에서 붙인다. 어두운 배경이라 클라이언트에서
    // 붙이면 첫 프레임에 흰 화면이 번쩍인다.
    return (
      <Html lang={locale} data-design="industrial">
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
