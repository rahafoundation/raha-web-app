import * as React from "react";
import { TextInput } from "../components/TextInput";
import { Button, ButtonSize, ButtonType } from "../components/Button";

export const AccountMigration: React.StatelessComponent<{}> = props => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}
    >
      <div
        style={{
          maxWidth: 800,
          margin: 16
        }}
      >
        <h1>Mobile App Migration Process</h1>
        <p>
          We are excited to announce the launch of our new Raha mobile app for
          Android and iOS! As part of this launch, we are deprecating usage of
          our web application. The mobile application will provide a better
          experience and more security when using Raha.
        </p>
        <p>
          Instead of using Google or Facebook, the mobile app will simply text a
          passcode to your mobile number to log you in.
        </p>
        <h4>
          Enter your mobile number below to associate it with your Raha account.
        </h4>
        <div style={{ display: "flex", alignItems: "center" }}>
          <TextInput
            onTextChange={() => {
              return;
            }}
            placeholder="(123) 444-5555"
          />
          <Button
            size={ButtonSize.LARGE}
            type={ButtonType.PRIMARY}
            onClick={() => {
              return;
            }}
            style={{ margin: 8 }}
          >
            Submit
          </Button>
        </div>
        <p>
          Great! You should now receive a text to download and install the app.
        </p>
        <p>
          Once you've installed the app, you will need to enter your mobile
          number once more to receive a passcode via text. Enter that passocde
          into the app to login and use Raha!
        </p>
        <p>
          If you have run into any issues, email us at{" "}
          <a href="mailto:help@raha.app">help@raha.app</a> or check out the
          migration thread on our forums. Thank you for being part of the Raha
          network and a more equitable economy for everyone!
        </p>
      </div>
    </div>
  );
};
