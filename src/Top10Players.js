import React, {Component} from 'react';
import './css/Helpers.css';
import {log} from './engine/helpers';

let location = window.location;
const SERVER_ENDPOINT = location.protocol + '//' + location.hostname + ':' + location.port + '/score';
log("Server's endpoint: " + SERVER_ENDPOINT);

class Top10Players extends Component {

    constructor() {
        super();

        this.state = {
            players: []
        };
    }

    componentDidMount() {
        this.loadData();
    }

    loadData() {
        let xhr = new XMLHttpRequest();
        xhr.open("GET", SERVER_ENDPOINT, true);
        xhr.onload = function (e) {
            if (e.status === 200) {
                try {
                    let data = JSON.parse(xhr.responseText);
                    log("JSON received");
                    this.setState({
                        players: data
                    });
                } catch (e) {
                    log("Wrong data format!");
                    this.props.troubleHandler("Error loading top 10 players");
                }
            } else {
                this.props.troubleHandler("Error loading top 10 players");
            }
        }.bind(this);
        xhr.onerror = function (e) {
            this.props.troubleHandler("Error loading top 10 players");
        }.bind(this);
        xhr.send();
    }

    render() {
        let i = 0;
        let content = this.state.players.map((e) => {
            console.log("Show 10 top players");
            let pn = e.playerName;
            let sc = e.score;
            return <div key={i++}>{pn}, score - {sc}</div>;
        });

        return (<div>{content}</div>);
    }
}

export default Top10Players;