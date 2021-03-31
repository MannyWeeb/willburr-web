import React from "react";
import request from "request";

import { SERVER } from "../App";
export class Explorer extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            formData: {},
            mode: "select"
        }

    }

    render() {
        const { data } = this.props;

        let servers = data ? data.servers : [];

        let explorerIndicator = "";

        if (!data) {
            explorerIndicator = <span className="spinner-grow text-primary ml-2"></span>
        } else if (!data.connected) {
            explorerIndicator = <span className="badge badge-danger mt-2 ml-2">Server Unreachable</span>
        }

        return <div className="p-2" id="explorer">
            <center>
                <h4>
                    Explorer
                    {explorerIndicator}
                </h4>

            </center>
            <hr />

            <h4>
                Servers
                <div className="btn-group float-right" id="server-controls" >
                    <div><svg className="fas fa-plus green pointable mx-1" id="create-server-btn" data-toggle="modal" data-target="#create-server-modal" title="Create Server"></svg></div>
                    <div onClick={this.toggleDeleteMode}><svg className="fas fa-trash red pointable mx-1" id="delete-server-btn" title="Delete Server"></svg></div>
                </div>
            </h4>
            <ul className="list-group mt-3" id="server-list">
                {Object.entries(servers).map((e) => {
                    let item = e[1];

                    return <li className={`list-group-item list-group-item-action my-1 ${item.status === "running" ? "border-success" : "border-danger"}`} key={item.name} onClick={() => this.props.showServer(item)}>
                        <label><b>{item.name}</b></label>
                        {this.state.mode === "select" ? <i className="float-right">{item.status === "running" ? "Online" : "Offline"}</i> :
                            <div className="float-right border border-danger px-2" id="delete-server-btn" onClick={() => this.deleteServer(item)}><svg className="fas fa-times red"></svg></div>}
                    </li>
                })}
            </ul>

            <div className="modal fade" id="create-server-modal">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title">Create a new server</h4>
                            <button type="button" className="close" data-dismiss="modal">&times;</button>
                        </div>

                        <form className="form-group" id="create-server-form" onSubmit={(e) => this.submitServer(e)}>
                            <div className="modal-body pb-0">

                                <input type="text" className="form-control my-2" placeholder="Name" onChange={this.changeName} required></input>
                                <input type="number" className="form-control my-2" placeholder="Port (0 to 65535)" onChange={this.changePort} min="0" max="65535" required></input>
                                <p className="text-secondary">Assigning globally available endpoints are only possible in the console for the meantime.</p>

                            </div>

                            <div className="modal-footer">
                                <button type="submit" className="btn btn-primary">Submit</button>
                            </div>
                        </form>

                    </div>
                </div>
            </div>
        </div>
    }

    changeName = (e) => {
        let { formData } = this.state;

        formData["name"] = e.target.value;
        this.setState({ formData });
    }

    changePort = (e) => {
        let { formData } = this.state;

        formData["port"] = e.target.value;

        this.setState({ formData });
    }

    toggleDeleteMode = () => {
        const { mode } = this.state;
        this.setState({ mode: mode === "select" ? "delete" : "select" });
    }

    submitServer = (e) => {
        e.preventDefault();

        let options = {
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(this.state.formData)
        }

        request.post(`${SERVER}/api/server`, options, (_, res, body) => {
            if (res.statusCode !== 200) {
                const { errors } = JSON.parse(body);
                alert(`Failed to create server\nReason:${errors}`);
            } else {
                this.props.serverCreated(JSON.parse(body).server);
            }
        });
    }

    deleteServer = (server) => {
        let options = {
            headers : {
                "Content-Type" : "application/json"
            },
            body : JSON.stringify({name : server.name})
        }
        
        if(server.status === "running"){
            alert(`Server ${server.name} is still running, please close it first before proceeding.`)
        }else{
            request.delete(`${SERVER}/api/server`, options , (err, res, body) => {
                if (res.statusCode === 200) {
                    this.props.serverDeleted(server.name);
                } else {
                    alert(`Failed to delete server ${server.name}\nReason:${body.reason}`);
                }
            });
        }
    }
}