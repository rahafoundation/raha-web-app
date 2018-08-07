import * as React from "react";
import { Link } from "react-router-dom";
import { IntlMessage } from "../components/IntlMessage";

const AcceptInvite: React.StatelessComponent<{}> = () => (
  <div className="AcceptInvite">
    <IntlMessage id="accept_invite" />
    <p>
      <a href="https://play.google.com/store/apps/details?id=app.raha.mobile">
        <img
          width="300"
          alt="Get it on Google Play"
          src="https://play.google.com/intl/en_us/badges/images/generic/en_badge_web_generic.png"
        />
      </a>
      {/* <br />
      <a href="https://play.google.com/store/apps/details?id=app.raha.mobile">
        <img
          width="250"
          alt="Get it on Apple Store"
          src="/apple_app_store.svg"
        />
      </a> */}
    </p>
    <p style={{ fontSize: 12 }}>
      Google Play and the Google Play logo are trademarks of Google LLC.
    </p>
    {/* <p style={{ fontSize: 12 }}>
      Apple and the Apple logo are trademarks of Apple Inc., registered in the
      U.S. and other countries and regions. App Store is a service mark of Apple
      Inc.
    </p> */}
  </div>
);

export { AcceptInvite };
