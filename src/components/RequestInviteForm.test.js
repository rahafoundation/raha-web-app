import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Enzyme, { mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16';
import { RequestInviteForm } from './RequestInviteForm';
import { IntlProvider } from 'react-intl'
import { mountWithIntl } from '../helpers/intl-enzyme-test-helper.js';

Enzyme.configure({ adapter: new Adapter() });

// ref: pattern for testing connected components
function setup() {
  const props = {
    partialAuthData: {
      displayName: "John Doe"
    },
    members: {},
    fetchMemberIfNeeded: async () => { {} }
  };
  
  const enzymeWrapper = mountWithIntl(<RequestInviteForm {...props} />);

  return {
    props,
    enzymeWrapper
  } 
}

describe('RequestInviteForm component', () => {
  it('renders without crashing', () => {
    setup();
  });

  it('sets an empty initial state', () => {
    const { enzymeWrapper } = setup();
    expect(enzymeWrapper.state()).toEqual({
        videoUrl: "",
        toUid: "",
        errorMessage: ""
      });
  });

  it('sets the display name on render', () => {
    const { props, enzymeWrapper } = setup();
    const displayNameInput = enzymeWrapper.find('.DisplayNameInput');

    let componentProps = displayNameInput.props();
    expect(componentProps.disabled).toBe(true);
    expect(componentProps.value).toBe(props.partialAuthData.displayName);
  });

  it('sets the video url when given an input', () => {
    const { props, enzymeWrapper } = setup();
    const videoUrlInput = enzymeWrapper.find('.VideoUrlInput');

    let url = "https://www.youtube.com/watch?v=1GGxzSPP0J0";
    let event = {target: {value: url}};
    let componentProps = videoUrlInput.props();
    componentProps.onChange(event);
    expect(enzymeWrapper.state().videoUrl).toBe(url);
  });

  it('sets the uid when given an input', () => {
    const { props, enzymeWrapper } = setup();
    const uidInput = enzymeWrapper.find('.UidInput');

    let uid = "https://www.youtube.com/watch?v=1GGxzSPP0J0";
    let event = {target: {value: uid}};
    let componentProps = uidInput.props();
    componentProps.onChange(event);
    expect(enzymeWrapper.state().toUid).toBe(uid);
  });

  it('displays an error message when trying to submit without video url', () => {
    const { props, enzymeWrapper } = setup();
    const button = enzymeWrapper.find('.InviteButton');
    button.simulate('click');
    expect(enzymeWrapper.state().errorMessage).not.toHaveLength(0);
  });

  it('displays an error message when trying to submit without toUid', () => {
    const { props, enzymeWrapper } = setup();
    const button = enzymeWrapper.find('.InviteButton');

    let url = "https://www.youtube.com/watch?v=1GGxzSPP0J0";
    let event = {target: {value: url}};
    enzymeWrapper.find('.VideoUrlInput').props().onChange(event);
    button.simulate('click');
    expect(enzymeWrapper.state().errorMessage).not.toHaveLength(0);
  });
});
