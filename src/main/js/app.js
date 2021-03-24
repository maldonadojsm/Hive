'use strict';

const React = require('react');
const ReactDOM = require('react-dom');
const client = require('./client');


class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {physicians: []};
    }

    componentDidMount() {
        client({method: 'GET', path: '/api/physicians'}).done(response => {
            this.setState({physicians: response.entity._embedded.physicians});
        });
    }

    render() {
        return (
            <PhysiciansList physicians={this.state.physicians}/>
        )
    }
}

/*
Render Table Listing Physician Information
 */
class PhysiciansList extends React.Component {
    render() {
        const physicians = this.props.physicians.map(physician =>
            //Call and render Physician structure component
            <Physician key={physician._links.self.href} physician={physician}/>
        );
        return (
            <table>
                <tbody>
                <tr>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Speciality</th>
                </tr>
                {physicians}
                </tbody>
            </table>
        )
    }
}

/*
Render structure of each row in Physician Table
 */
class Physician extends React.Component {
    render() {
        return (
            <tr>
                <td>{this.props.physician.firstName}</td>
                <td>{this.props.physician.lastName}</td>
                <td>{this.props.physician.specialty}</td>
            </tr>
        )
    }
}

ReactDOM.render(
    <App/>,
    document.getElementById('react')
)