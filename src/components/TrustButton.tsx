import * as React from 'react';
import { getTrustOperation } from '../operations';

// TODO code duplication in functions/srs/index.ts, decomp.

// TODO(#8) instead of only trust, should be multi-functional button
export class TrustButton extends React.Component<{ toUid: string, toMid: string, creatorMid: string }, {}> {
    onClick = () => {
        const trustOp = getTrustOperation(this.props.toUid, this.props.toMid, this.props.creatorMid);
        // TODO support this
        alert(`This operation for upserting ${JSON.stringify(trustOp)} not supported yet.`);
    }

    render() {
        return (
            <button onClick={this.onClick}>Trust</button>
        );
    }
}
