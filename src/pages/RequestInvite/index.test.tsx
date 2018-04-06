// TODO: seems odd that we need to test this by running everything, including intl
// and more than just shallow rendering.
import { shallow } from "enzyme";
import * as React from "react";
import * as ReactDOM from "react-dom";

import { mountWithIntl } from "../../helpers/intl-enzyme-test-helper";
import { OperationData } from "../../operations";
import { RequestInvite } from "./";

// ref: pattern for testing connected components
function setup() {
  const props = {
    isAuthLoaded: true,
    authFirebaseUser: {
      uid: "me"
    },
    memberId: "me$1234",
    isToMemberDocLoaded: true,
    isAuthMemberDocLoaded: true,
    notSignedIn: false,
    fullName: "Member Me",
    toMemberDoc: {
      get: (key: string) => {
        if (key === "mid") {
          return "friend$1234";
        }
        return undefined;
      },
      id: "ijalir"
    },
    postOperation: (op: OperationData) => () => {
      /* no-op */
    },
    fetchMemberByMidIfNeeded: (mid: string) => () => {
      /* no-op */
    },
    fetchMemberByUidIfNeeded: (uid: string) => () => {
      /* no-op */
    },
    match: {
      params: { memberId: "me$1234" }
    }
  };

  const enzymeWrapper = shallow(<RequestInvite {...props} />);

  return {
    props,
    enzymeWrapper
  };
}

describe("RequestInvite component", () => {
  it("renders without crashing", () => {
    setup();
  });

  it("sets an initial state", () => {
    const { enzymeWrapper } = setup();
    expect(enzymeWrapper.state()).toEqual({
      videoUrl: "",
      toUid: "",
      errorMessage: "",
      fullName: "Member Me"
    });
  });

  it("sets the full name on render", () => {
    const { props, enzymeWrapper } = setup();
    const displayNameInput = enzymeWrapper.find(".DisplayNameInput");

    const componentProps = displayNameInput.props();
    expect(componentProps.value).toBe("Member Me");
  });

  // TODO: pretty sure this doesn't actually work, the .VideoUrlInput
  // element isn't even available. This should be replaced with a shallow
  // rendering test that checks that the YoutubeVideo receives the correct
  // props.
  // it("sets the video url when given an input", () => {
  //   const { props, enzymeWrapper } = setup();
  //   const videoUrlInput = enzymeWrapper.find(".VideoUrlInput");

  //   const url = "https://www.youtube.com/watch?v=1GGxzSPP0J0";
  //   const event = { target: { value: url } };
  //   videoUrlInput.simulate("change", event);
  //   expect(enzymeWrapper.state().videoUrl).toBe(url);
  // });

  it("sets the full name when given an input", () => {
    const { props, enzymeWrapper } = setup();
    const displayNameInput = enzymeWrapper.find(".DisplayNameInput");

    const newName = "My Weird Name";
    const event = { currentTarget: { value: newName } };
    displayNameInput.simulate("change", event);
    expect(enzymeWrapper.state().fullName).toBe(newName);
  });

  it("displays an error message when trying to submit without video url", () => {
    const { props, enzymeWrapper } = setup();
    const button = enzymeWrapper.find(".InviteButton");
    button.simulate("click", { stopPropagation() { /* no-op */ } });
    expect(enzymeWrapper.state().errorMessage).not.toHaveLength(0);
  });
});
