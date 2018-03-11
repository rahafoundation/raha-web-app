import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Enzyme, { mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16';
import { RequestInvite } from './RequestInvite';

Enzyme.configure({ adapter: new Adapter() });

// ref: pattern for testing connected components
function setup() {
  const props = {
    isAuthLoaded: true,
    authFirebaseUser: {
      uid: 'me'
    },
    memberId: 'me$1234',
    isAuthMemberDocLoaded: true,
    authMemberDoc: null,
    fullName: 'Member Me',
    toMemberDoc: {
      get: (key) => {
        return {
          'mid': 'friend$1234'
        }[key];
      },
      id: 'ijalir'
    },
    postOperation: async () => {},
    fetchMemberByUidIfNeeded: async () => {},
    fetchMemberByUidIfNeeded: async () => {},
  };

  const enzymeWrapper = mount(<RequestInvite {...props} />);

  return {
    props,
    enzymeWrapper
  }
}

describe('RequestInvite component', () => {
  it('renders without crashing', () => {
    setup();
  });

  it('sets an initial state', () => {
    const { enzymeWrapper } = setup();
    expect(enzymeWrapper.state()).toEqual({
      videoUrl: '',
      toUid: '',
      errorMessage: '',
      fullName: 'Member Me',
    });
  });

  it('sets the full name on render', () => {
    const { props, enzymeWrapper } = setup();
    const displayNameInput = enzymeWrapper.find('.DisplayNameInput');

    let componentProps = displayNameInput.props();
    expect(componentProps.value).toBe('Member Me');
  });

  it('sets the video url when given an input', () => {
    const { props, enzymeWrapper } = setup();
    const videoUrlInput = enzymeWrapper.find('.VideoUrlInput');

    let url = "https://www.youtube.com/watch?v=1GGxzSPP0J0";
    let event = { target: { value: url } };
    let componentProps = videoUrlInput.props();
    componentProps.onChange(event);
    expect(enzymeWrapper.state().videoUrl).toBe(url);
  });

  it('sets the full name when given an input', () => {
    const { props, enzymeWrapper } = setup();
    const displayNameInput = enzymeWrapper.find('.DisplayNameInput');

    let fullName = "My Weird Name";
    let event = { target: { value: fullName } };
    let componentProps = displayNameInput.props();
    componentProps.onChange(event);
    expect(enzymeWrapper.state().fullName).toBe(fullName);
  });

  it('displays an error message when trying to submit without video url', () => {
    const { props, enzymeWrapper } = setup();
    const button = enzymeWrapper.find('.InviteButton');
    button.simulate('click');
    expect(enzymeWrapper.state().errorMessage).not.toHaveLength(0);
  });
});
