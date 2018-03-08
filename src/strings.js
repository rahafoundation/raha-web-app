import { defineMessages } from 'react-intl';

const STRINGS = defineMessages({
    invited_by: {
        id: 'invited_by',
        defaultMessage: 'Invited By ({value})',
    },
    invites: {
        id: 'invites',
        defaultMessage: 'Invites ({value})',
    },
    trusted_by: {
        id: 'trusted_by',
        defaultMessage: 'Trusted By ({value})',
    },
    trusts: {
        id: 'trusts',
        defaultMessage: 'Trusts ({value})',
    },
    loading: {
        id: 'loading',
        defaultMessage: 'Loading',
    },    
    join_video: {
        id: 'join_video',
        defaultMessage: 'Join Video',
    },
    page_not_found: {
        id: 'page_not_found',
        defaultMessage: '{404} page not found, go {home}.',
    },
    // Trust Level Strings
    trust_suggestion_active_longer: {
        id: 'trust_suggestion_active_longer',
        defaultMessage: 'Stay active on the network for more days to increase your trust level.',
    },
    trust_suggestion_recieve_trust: {
        id: 'trust_suggestion_recieve_trust',
        defaultMessage: 'Increase your trust by receiving trust from {accounts} level {accountlevel}+ accounts.',
    },
    trust_suggestion_max: {
        id: 'trust_suggestion_max',
        defaultMessage: 'You are max trust level.',
    },
});

export default STRINGS;