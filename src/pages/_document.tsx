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

    return (
      <Html lang={locale}>
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
