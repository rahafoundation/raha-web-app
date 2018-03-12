import { defineMessages } from 'react-intl';

const english = require('./data/i18n/english.json')

const messages = {};

Object.entries(english).forEach(entry => messages[entry[0]] = {id: entry[1], })
const englishMessages = {
invited_by : 'Invited By ({value})',
invites : 'Invites ({value})',
join_video : 'Join Video',
loading : 'Loading',
page_not_found : '{404} page not found, go {home}.',
trust_suggestion_active_longer : 'Stay active on the network for more days to increase your trust level.',
trust_suggestion_max : 'You are max trust level.',
trust_suggestion_recieve_trust : 'Increase your trust by receiving trust from {accounts} level {accountlevel}+ accounts.',
trusted_by : 'Trusted By ({value})',
trusts : 'Trusts ({value})',: `We are excited to have you become a member of the Raha.io Network!,

    Joining is and always will be <b>completely free</b>. You must be
    invited by an existing member in person via video using your full name.
    Part of the value of Raha.io Network is that it's a unique identity
    platform. If you sign up a fake identity or have multiple accounts, or invite
    people with fake/duplicate accounts, your account will be frozen. If you know
    of any fake accounts, report them to increase your income level! Ultimate
    decisions of legitimacy will be made by the Raha.io Board.
    Only accept an invite if you trust this member and share similar values, because
    they will be your default admin in the event you need to recover your
    account and default representantive to select your vote for the Raha.io Board. If it turns out
    they invited many fake or duplicate accounts, then your account is at risk of being flagged.`, : };

const STRINGS = defineMessages({});

export default STRINGS;