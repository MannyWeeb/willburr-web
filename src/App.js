import React from "react";
import { Navigator } from "./components/Navigator";
import { Explorer } from "./components/Explorer";
import { Home } from "./views/Home";

import request from "request";
import { Server } from "./views/Server";

const SERVERADDR = window.location.hostname;
const SERVER = `${window.location.protocol}//${SERVERADDR}:55432`;

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            view: "home",
            globalData: null,
            contextData: null
        }
    }

    componentDidMount(){
        this.fetchData();
    }

    render() {
        let view = this.showPanel(this.state.view);

        return <React.StrictMode>


            <div className="container-fluid" id="mainPanel">
                <Navigator navigateTo={(view) => this.setState({ view })} />

                <div className="row mx-3" id="contentPanel">
                    <div className="col-xl-3 col-lg-4 col-md-12 col-sm-12 border">
                        <Explorer data={this.state.globalData} showServer={this.showServer} serverCreated={this.handleServerAddition} serverDeleted={this.handleServerDeletion} />
                    </div>

                    <div className="col-xl-9 col-lg-8 col-md-12 col-sm-12 border">
                        {view}
                    </div>
                </div>
            </div>

        </React.StrictMode>

    }

    showPanel = (view) => {
        switch (view) {
            case "server": return <Server data={this.state.contextData} update={this.handleServerUpdate} key={this.state.contextData.name} />;
            default: return <Home />;
        }
    }


    showServer = (server) => {
        this.setState({
            view: "server",
            contextData: server
        });
    }

    fetchData = () => {
        request.get(`${SERVER}/api/getData`, {}, (err, __, body) => {
            if (!err) {
                const { servers, strings } = JSON.parse(body);

                this.setState({
                    globalData: {
                        servers,
                        strings,
                        connected: true
                    }
                });
            } else {
                this.setState({
                    globalData: {
                        servers: {},
                        strings: {},
                        connected: false
                    }
                });
            }
        });
    }


    handleServerUpdate = (server) => {
        let { contextData, globalData } = this.state;
        globalData.servers[server.name] = server;

        if (server.name === contextData.name) {
            contextData = server;
        }

        this.setState({ contextData, globalData });
    }

    handleServerAddition = (server) => {
        let { globalData } = this.state;
        globalData.servers[`${server.name}`] = server;

        this.setState({ globalData });
    }

    handleServerDeletion = (serverName) => {
        let { globalData } = this.state;

        delete globalData.servers[serverName];
        this.setState({
            globalData,
            view : "home",
            contextData : null
        });
    }

}

export { App, SERVER, SERVERADDR };