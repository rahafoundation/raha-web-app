import * as React from "react";
import { Link } from "react-router-dom";
import { IntlMessage } from "../components/IntlMessage";

const AcceptInvite: React.StatelessComponent<{}> = () => {
  // Parse out invite token
  let inviteToken;
  const query = window.location.search.substring(1);
  const queryVars = query.split("&");
  for (const queryVar of queryVars) {
    const pair = queryVar.split("=");
    if (decodeURIComponent(pair[0]) === "t") {
      inviteToken = decodeURIComponent(pair[1]);
      break;
    }
  }

  if (!inviteToken) {
    return (
      <div style={{ textAlign: "center" }}>
        <h3>
          <IntlMessage id="invalid_accept_invite" />
        </h3>
      </div>
    );
  }

  // TODO: Pull these schemes from a raha-api/shared?
  const customSchemeDeeplink = "raha://link/invite?t=" + inviteToken;
  const httpsSchemeDeeplink = "https://d.raha.app/invite?t=" + inviteToken;

  return (
    <div className="AcceptInviteSteps">
      <div className="AcceptInviteStep">
        <h3>
          <IntlMessage id="accept_invite_step1" />
        </h3>
        <a href="https://play.google.com/store/apps/details?id=app.raha.mobile">
          <img
            width="300"
            alt="Get it on Google Play"
            src="https://play.google.com/intl/en_us/badges/images/generic/en_badge_web_generic.png"
          />
        </a>
        <br />
        <a href="https://itunes.apple.com/app/raha/id1434224783?ls=1&mt=8">
          <img
            width="250"
            alt="Download on the Apple App Store"
            src="https://linkmaker.itunes.apple.com/assets/shared/badges/en-us/appstore-lrg.svg"
          />
        </a>
        <p style={{ fontSize: 12 }}>
          Google Play and the Google Play logo are trademarks of Google LLC.
        </p>
        <p style={{ fontSize: 12 }}>
          Apple and the Apple logo are trademarks of Apple Inc., registered in
          the U.S. and other countries and regions. App Store is a service mark
          of Apple Inc.
        </p>
      </div>
      <div className="AcceptInviteStep">
        <h3>
          <IntlMessage id="accept_invite_step2" />
        </h3>
        <p>
          {/* We are providing both links in case the HTTPS link fails to open the app due to the email client
          not respecting the app link to Raha. We're unsure if raha:// works in all cases, so we're leaving both for now. */}
          <a style={{ fontSize: 18 }} href={httpsSchemeDeeplink}>
            {httpsSchemeDeeplink}
          </a>
        </p>
        <IntlMessage id="accept_invite_step2_fallback" />
        <p>
          <a style={{ fontSize: 18 }} href={customSchemeDeeplink}>
            {customSchemeDeeplink}
          </a>
        </p>
      </div>
    </div>
  );
};

export { AcceptInvite };
