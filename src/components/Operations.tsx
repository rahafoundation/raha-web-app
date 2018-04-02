import React, { Component } from 'react';
import { connect } from 'react-redux';

import { fetchOperations } from '../actions';
import { db } from '../firebaseInit';

class Operations extends Component {
    componentDidMount() {
        this.props.fetchOperations(db.collection('operations'));
    }

    render() {
        return (
            <div>
                <h1>Operations stream</h1>
                <span>{ JSON.stringify(this.props.ops) }</span>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return { ops: state.operations };
}

export default connect(mapStateToProps, { fetchOperations })(Operations);