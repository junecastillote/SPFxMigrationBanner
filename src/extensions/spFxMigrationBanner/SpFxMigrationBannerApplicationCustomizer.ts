import { Log } from "@microsoft/sp-core-library";
import {
  BaseApplicationCustomizer,
  PlaceholderContent,
  PlaceholderName,
} from "@microsoft/sp-application-base";

import * as strings from "SpFxMigrationBannerApplicationCustomizerStrings";

const LOG_SOURCE: string = "SpFxMigrationBannerApplicationCustomizer";

export interface ISpFxMigrationBannerApplicationCustomizerProperties {
  bannerTitle: string;
  bannerMessage: string;
  targetSiteUrl: string;
  retirementDate: string;
  faqUrl: string;
}

export default class SpFxMigrationBannerApplicationCustomizer extends BaseApplicationCustomizer<ISpFxMigrationBannerApplicationCustomizerProperties> {
  private _topPlaceholder: PlaceholderContent | undefined;

  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);

    this.context.placeholderProvider.changedEvent.add(this, () =>
      this.renderBanner(),
    );

    return Promise.resolve();
  }

  private renderBanner(): void {
    const bannerTitle =
      this.properties.bannerTitle || "⚠ LEGACY SHAREPOINT SITE";

    const bannerMessage =
      this.properties.bannerMessage ||
      "Content has been migrated to the new Microsoft 365 environment. Please use the new site going forward.";

    const targetSiteUrl = this.properties.targetSiteUrl;

    if (!targetSiteUrl) {
      return;
    }

    const retirementDate = this.properties.retirementDate || "";

    const faqUrl = this.properties.faqUrl || "";

    if (!this._topPlaceholder) {
      this._topPlaceholder = this.context.placeholderProvider.tryCreateContent(
        PlaceholderName.Top,
      );

      if (!this._topPlaceholder) {
        return;
      }

      this._topPlaceholder.domElement.innerHTML = `
      <div style="
        background:#FFF4CE;
        border-bottom:2px solid #FFB900;
        padding:12px 20px;
        font-family:'Segoe UI',sans-serif;
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:20px;
        flex-wrap:wrap;
      ">

        <div>

          <div style="
            font-size:16px;
            font-weight:600;
            color:#8A5100;
            margin-bottom:4px;
          ">
            ${bannerTitle}
          </div>

          <div style="
            color:#333333;
            font-size:14px;
          ">
            ${bannerMessage}
          </div>

          ${
            retirementDate
              ? `
            <div style="
              color:#8A5100;
              font-size:13px;
              margin-top:8px;
              font-weight:600;
            ">
              This site will be retired on ${retirementDate}.
            </div>
          `
              : ""
          }

        </div>

        <div style="
          display:flex;
          gap:10px;
          flex-wrap:wrap;
        ">

          ${
            targetSiteUrl
              ? `
            <a
              href="${targetSiteUrl}"
              target="_blank"
              rel="noopener noreferrer"
              style="
                background:#FFB900;
                color:#000000;
                text-decoration:none;
                padding:10px 16px;
                border-radius:4px;
                font-weight:600;
                white-space:nowrap;
              "
            >
              Go to New Site
            </a>
          `
              : ""
          }

          ${
            faqUrl
              ? `
            <a
              href="${faqUrl}"
              target="_blank"
              rel="noopener noreferrer"
              style="
                background:#FFFFFF;
                color:#8A5100;
                text-decoration:none;
                padding:10px 16px;
                border:1px solid #8A5100;
                border-radius:4px;
                font-weight:600;
                white-space:nowrap;
              "
            >
              Migration FAQ
            </a>
          `
              : ""
          }

        </div>

      </div>
    `;
    }
  }
}
