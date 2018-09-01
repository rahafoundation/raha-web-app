import * as React from "react";
import { Link } from "react-router-dom";
import { IntlMessage } from "../components/IntlMessage";

const AcceptInvite: React.StatelessComponent<{}> = () => (
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
        Apple and the Apple logo are trademarks of Apple Inc., registered in the
        U.S. and other countries and regions. App Store is a service mark of
        Apple Inc.
      </p>
    </div>
    <div className="AcceptInviteStep">
      <h3>
        <IntlMessage id="accept_invite_step2" />
      </h3>
      <a style={{ fontSize: 18 }} href={window.location.href}>
        {window.location.href}
      </a>
    </div>
  </div>
);

export { AcceptInvite };
