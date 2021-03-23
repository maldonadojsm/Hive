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