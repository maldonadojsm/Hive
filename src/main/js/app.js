'use strict';

const React = require('react');
const ReactDOM = require('react-dom');
const when = require('when');
const client = require('./client');

const follow = require('./follow'); // function to hop multiple links by "rel"

const root = '/api';

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {physicians: [], attributes: [], pageSize: 2, links: {}};
        this.updatePageSize = this.updatePageSize.bind(this);
        this.onCreate = this.onCreate.bind(this);
        this.onUpdate = this.onUpdate.bind(this);
        this.onDelete = this.onDelete.bind(this);
        this.onNavigate = this.onNavigate.bind(this);
    }

    // tag::follow-2[]
    loadFromServer(pageSize) {
        follow(client, root, [ // <1>
            {rel: 'physicians', params: {size: pageSize}}]
        ).then(physicianCollection => { // <2>
            return client({
                method: 'GET',
                path: physicianCollection.entity._links.profile.href,
                headers: {'Accept': 'application/schema+json'}
            }).then(schema => {
                this.schema = schema.entity;
                this.links = physicianCollection.entity._links;
                return physicianCollection;
            });
        }).then(physicianCollection => { // <3>
            return physicianCollection.entity._embedded.physicians.map(physician =>
                client({
                    method: 'GET',
                    path: physician._links.self.href
                })
            );
        }).then(physicianPromises => { // <4>
            return when.all(physicianPromises);
        }).done(physicians => { // <5>
            this.setState({
                physicians: physicians,
                attributes: Object.keys(this.schema.properties),
                pageSize: pageSize,
                links: this.links
            });
        });
    }

    // end::follow-2[]

    // tag::create[]
    onCreate(newPhysician) {
        const self = this;
        follow(client, root, ['physicians']).then(response => {
            return client({
                method: 'POST',
                path: response.entity._links.self.href,
                entity: newPhysician,
                headers: {'Content-Type': 'application/json'}
            })
        }).then(response => {
            return follow(client, root, [{rel: 'physicians', params: {'size': self.state.pageSize}}]);
        }).done(response => {
            if (typeof response.entity._links.last !== "undefined") {
                this.onNavigate(response.entity._links.last.href);
            } else {
                this.onNavigate(response.entity._links.self.href);
            }
        });
    }

    // end::create[]

    // tag::update[]
    onUpdate(physician, updatePhysician) {
        client({
            method: 'PUT',
            path: physician.entity._links.self.href,
            entity: updatePhysician,
            headers: {
                'Content-Type': 'application/json',
                'If-Match': physician.headers.Etag
            }
        }).done(response => {
            this.loadFromServer(this.state.pageSize);
        }, response => {
            if (response.status.code === 412) {
                alert('DENIED: Unable to update ' +
                    physician.entity._links.self.href + '. Your copy is stale.');
            }
        });
    }

    // end::update[]

    // tag::delete[]
    onDelete(physician) {
        client({method: 'DELETE', path: physician.entity._links.self.href}).done(response => {
            this.loadFromServer(this.state.pageSize);
        });
    }

    // end::delete[]

    // tag::navigate[]
    onNavigate(navUri) {
        client({
            method: 'GET',
            path: navUri
        }).then(physicianCollection => {
            this.links = physicianCollection.entity._links;

            return physicianCollection.entity._embedded.physicians.map(physician =>
                client({
                    method: 'GET',
                    path: physician._links.self.href
                })
            );
        }).then(physicianPromises => {
            return when.all(physicianPromises);
        }).done(physicians => {
            this.setState({
                physicians: physicians,
                attributes: Object.keys(this.schema.properties),
                pageSize: this.state.pageSize,
                links: this.links
            });
        });
    }

    // end::navigate[]

    // tag::update-page-size[]
    updatePageSize(pageSize) {
        if (pageSize !== this.state.pageSize) {
            this.loadFromServer(pageSize);
        }
    }

    // end::update-page-size[]

    // tag::follow-1[]
    componentDidMount() {
        this.loadFromServer(this.state.pageSize);
    }

    // end::follow-1[]

    render() {
        return (
            <div>
                <CreateDialog attributes={this.state.attributes} onCreate={this.onCreate}/>
                <PhysicianList physicians={this.state.physicians}
                               links={this.state.links}
                               pageSize={this.state.pageSize}
                               attributes={this.state.attributes}
                               onNavigate={this.onNavigate}
                               onUpdate={this.onUpdate}
                               onDelete={this.onDelete}
                               updatePageSize={this.updatePageSize}/>
            </div>
        )
    }
}

// tag::create-dialog[]
class CreateDialog extends React.Component {

    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(e) {
        e.preventDefault();
        const newPhysician = {};
        this.props.attributes.forEach(attribute => {
            newPhysician[attribute] = ReactDOM.findDOMNode(this.refs[attribute]).value.trim();
        });
        this.props.onCreate(newPhysician);
        this.props.attributes.forEach(attribute => {
            ReactDOM.findDOMNode(this.refs[attribute]).value = ''; // clear out the dialog's inputs
        });
        window.location = "#";
    }

    render() {
        const inputs = this.props.attributes.map(attribute =>
            <p key={attribute}>
                <input type="text" placeholder={attribute} ref={attribute} className="field"/>
            </p>
        );
        return (
            <div>
                <a href="#createPhysician">Create</a>

                <div id="createPhysician" className="modalDialog">
                    <div>
                        <a href="#" title="Close" className="close">X</a>

                        <h2>Create new physician</h2>

                        <form>
                            {inputs}
                            <button onClick={this.handleSubmit}>Create</button>
                        </form>
                    </div>
                </div>
            </div>
        )
    }
}

// end::create-dialog[]

// tag::update-dialog[]
class UpdateDialog extends React.Component {

    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(e) {
        e.preventDefault();
        const updatedPhysician = {};
        this.props.attributes.forEach(attribute => {
            updatedPhysician[attribute] = ReactDOM.findDOMNode(this.refs[attribute]).value.trim();
        });
        this.props.onUpdate(this.props.physician, updatedPhysician);
        window.location = "#";
    }

    render() {
        const inputs = this.props.attributes.map(attribute =>
            <p key={this.props.physician.entity[attribute]}>
                <input type="text" placeholder={attribute}
                       defaultValue={this.props.physician.entity[attribute]}
                       ref={attribute} className="field"/>
            </p>
        );

        const dialogId = "updatePhysician-" + this.props.physician.entity._links.self.href;

        return (
            <div key={this.props.physician.entity._links.self.href}>
                <a href={"#" + dialogId}>Update</a>
                <div id={dialogId} className="modalDialog">
                    <div>
                        <a href="#" title="Close" className="close">X</a>

                        <h2>Update a physician</h2>

                        <form>
                            {inputs}
                            <button onClick={this.handleSubmit}>Update</button>
                        </form>
                    </div>
                </div>
            </div>
        )
    }

};

// end::update-dialog[]


class PhysicianList extends React.Component {

    constructor(props) {
        super(props);
        this.handleNavFirst = this.handleNavFirst.bind(this);
        this.handleNavPrev = this.handleNavPrev.bind(this);
        this.handleNavNext = this.handleNavNext.bind(this);
        this.handleNavLast = this.handleNavLast.bind(this);
        this.handleInput = this.handleInput.bind(this);
    }

    // tag::handle-page-size-updates[]
    handleInput(e) {
        e.preventDefault();
        const pageSize = ReactDOM.findDOMNode(this.refs.pageSize).value;
        if (/^[0-9]+$/.test(pageSize)) {
            this.props.updatePageSize(pageSize);
        } else {
            ReactDOM.findDOMNode(this.refs.pageSize).value = pageSize.substring(0, pageSize.length - 1);
        }
    }

    // end::handle-page-size-updates[]

    // tag::handle-nav[]
    handleNavFirst(e) {
        e.preventDefault();
        this.props.onNavigate(this.props.links.first.href);
    }

    handleNavPrev(e) {
        e.preventDefault();
        this.props.onNavigate(this.props.links.prev.href);
    }

    handleNavNext(e) {
        e.preventDefault();
        this.props.onNavigate(this.props.links.next.href);
    }

    handleNavLast(e) {
        e.preventDefault();
        this.props.onNavigate(this.props.links.last.href);
    }

    // end::handle-nav[]
    // tag::employee-list-render[]
    render() {
        const physicians = this.props.physicians.map(physician =>
            <Physician key={physician.entity._links.self.href}
                       physician={physician}
                       attributes={this.props.attributes}
                       onUpdate={this.props.onUpdate}
                       onDelete={this.props.onDelete}/>
        );

        const navLinks = [];
        if ("first" in this.props.links) {
            navLinks.push(<button key="first" onClick={this.handleNavFirst}>&lt;&lt;</button>);
        }
        if ("prev" in this.props.links) {
            navLinks.push(<button key="prev" onClick={this.handleNavPrev}>&lt;</button>);
        }
        if ("next" in this.props.links) {
            navLinks.push(<button key="next" onClick={this.handleNavNext}>&gt;</button>);
        }
        if ("last" in this.props.links) {
            navLinks.push(<button key="last" onClick={this.handleNavLast}>&gt;&gt;</button>);
        }

        return (
            <div>
                <input ref="pageSize" defaultValue={this.props.pageSize} onInput={this.handleInput}/>
                <table>
                    <tbody>
                    <tr>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Specialty</th>
                        <th></th>
                        <th></th>
                    </tr>
                    {physicians}
                    </tbody>
                </table>
                <div>
                    {navLinks}
                </div>
            </div>
        )
    }

    // end::employee-list-render[]
}

// tag::employee[]
class Physician extends React.Component {

    constructor(props) {
        super(props);
        this.handleDelete = this.handleDelete.bind(this);
    }

    handleDelete() {
        this.props.onDelete(this.props.physician);
    }

    render() {
        return (
            <tr>
                <td>{this.props.physician.entity.firstName}</td>
                <td>{this.props.physician.entity.lastName}</td>
                <td>{this.props.physician.entity.specialty}</td>
                <td>
                    <UpdateDialog physician={this.props.physician}
                                  attributes={this.props.attributes}
                                  onUpdate={this.props.onUpdate}/>
                </td>
                <td>
                    <button onClick={this.handleDelete}>Delete</button>
                </td>
            </tr>
        )
    }
}

// end::employee[]

ReactDOM.render(
    <App/>,
    document.getElementById('react')
)
