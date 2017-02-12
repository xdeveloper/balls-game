import React, {Component} from 'react';
import './css/Helpers.css';
import {SAVE_USER_SCORE_ENDPOINT} from "./App";

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
        xhr.open("GET", SAVE_USER_SCORE_ENDPOINT, true);
        xhr.onload = function (e) {
            let data = JSON.parse(xhr.responseText);
            console.log(data);
            this.setState({
                players: data
            });
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