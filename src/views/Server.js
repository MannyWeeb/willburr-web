import React from "react";
import { Endpoint } from "../components/Endpoint";
import { SERVER } from "../App";

import request from "request";

export class Server extends React.Component {

    constructor(props) {
        super(props);
        this.timer = null;

        this.state = {
            formData: {
                endpoint: {
                    server: this.props.data.name
                }
            },
            mode: "select"
        }


    }

    componentDidMount() {
        if (this.props.data.status === "running") {
            this.timer = setInterval(this.getElapsed, 1000);
        } else {
            clearInterval(this.timer);
        }
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    render() {
        let { name, port, status, strings, options, totalVisits, totalRuntime, endStamp } = this.props.data;

        let endpoints = "";

        if (Object.keys(strings).length !== 0) {
            endpoints = <ul className="list-group">
                {Object.keys(strings).map((key) => {

                    return <Endpoint key={key} data={{ name: key, value: strings[key], port, mode: this.state.mode }} onDelete={this.deleteEndpoint} />
                })}
            </ul>
        } else {
            endpoints = <h5 className="alert-danger p-2 text-center">No Endpoints found, try creating one.</h5>
        }

        let runtime = "No data available";


        if (status === "running") {
            runtime = <p>Runtime: {totalRuntime || "No data available"}</p>
        } else {
            runtime = <p>Last run: {!endStamp ? "Never" : new Date(endStamp).toDateString()}</p>
        }


        return <div className="mx-4 my-2">

            <div>
                <span className="display-4 m-0">
                    <svg className={`fas fa-server mr-3`}></svg>
                    <b>{name}:{port}</b>
                </span>
                <span className="custom-control custom-switch big-switch px-0 float-right">
                    <input type="checkbox" className="custom-control-input" id="server-switch" name="serverSwitch" checked={status === "running"} onChange={(e) => this.toggle(e)} />
                    <label className="custom-control-label" htmlFor="server-switch">{status === "running" ? "On" : "Off"}</label>
                </span>
            </div>

            <hr />

            <h4>Visits: {totalVisits}
                {runtime}
            </h4>


            <br />

            <div className="container-fluid p-0">
                <div className="row">
                    <div className="col">
                        <div id="endpoint-list">
                            <h4>
                                Server Endpoints:
                                <div className="btn-group float-right" id="endpoint-controls">
                                    <div><svg className="fas fa-plus green pointable mx-1" id="create-endpoint-btn" data-toggle="modal" data-target="#create-endpoint-modal" title="Create Endpoint"></svg></div>
                                    <div onClick={this.toggleDeleteMode}><svg className="fas fa-trash red pointable mx-1" id="delete-endpoint-btn" title="Delete Endpoint"></svg></div>
                                </div>
                            </h4>
                            {endpoints}
                        </div>

                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <div className="accordion" id="server-meta">
                            <div className="card">
                                <div className="card-header">
                                    <h4 className="card-link pointable" data-toggle="collapse" href="#server-options">Server Options:</h4>
                                </div>
                                <div className="collapse show" data-parent="#server-meta" id="server-options">
                                    <div className="card-body">
                                        {Object.keys(options).map((e) => {
                                            return <h5 key={e}>
                                                <em>{e}</em> : <b>{JSON.stringify(options[e])}</b>
                                            </h5>
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="modal fade" id="create-endpoint-modal">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title">Create a new endpoint</h4>
                            <button className="close" type="button" data-dismiss="modal">&times;</button>
                        </div>

                        <form className="form-group my-2" id="endpoint-form" onSubmit={(e) => this.submitEndpoint(e)}>
                            <div className="modal-body">
                                <label htmlFor="endpoint-name-input">Name:</label>
                                <input type="text" className="form-control" id="endpoint-name-input" onChange={this.changeEndpointName} required></input>

                                <label className="mt-2" htmlFor="endpoint-directory-input">Path:</label>
                                <input className="form-control" type="text" id="endpoint-directory-input" onChange={this.changeEndpointDir} required></input>
                                <label className="text-secondary" htmlFor="#endpoint-directory-input">Note: Path is relative to the default static content folder.(C:\My Web Sites) but feel free to put in absolute paths.</label>
                            </div>

                            <div className="modal-footer">
                                <button className="btn btn-primary" type="submit">Submit</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    }

    changeEndpointName = (e) => {
        let { endpoint } = this.state.formData;

        endpoint.name = e.target.value;

        this.setState({
            formData: {
                endpoint
            }
        });
    }

    changeEndpointDir = (e) => {
        let { endpoint } = this.state.formData;

        endpoint.directory = e.target.value;

        this.setState({
            formData: {
                endpoint
            }
        });
    }

    toggleDeleteMode = () => {
        const { mode } = this.state;
        this.setState({ mode: mode === "select" ? "delete" : "select" });
    }

    toggle = (e) => {
        const action = e.target.checked ? "run" : "stop";

        let options = {
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                action,
                target: this.props.data.name
            })
        }

        request.post(`${SERVER}/api/serverControl`, options, (err, res, body) => {
            if (err) {
                alert(`Failed to ${action} server ${this.props.data.name}\nServer unreachable.`);
            } else {
                const { statusCode } = res;

                const { server, result } = JSON.parse(body) || {};

                if (statusCode === 200) {
                    //Do something? congratulate?
                    if (server.status === "running") {
                        this.timer = setInterval(this.getElapsed, 1000);
                    } else {
                        clearInterval(this.timer);
                    }
                } else if (result) {
                    const { error, reason } = result;
                    alert(`Error:${error}\nReason:${reason}`);
                }

                this.props.update(server);
            }
        });
    }

    getElapsed = () => {
        const since = new Date(this.props.data.startStamp);
        let now = new Date();


        let difference = (now.getTime() - since.getTime()) / 1000;

        const _f = (mod) => {
            const _result = difference % mod;
            difference = difference / mod;
            return Math.floor(_result);
        }

        const _s = _f(60);
        const _m = _f(60);
        const _h = _f(24);
        const _d = _f(24);

        const days = `${_d !== 0 ? `${_d} day${_d > 1 ? "s" : ""} ` : ""}`;
        const hours = `${_h !== 0 ? `${_h} hour${_h > 1 ? "s" : ""} ` : ""}`;
        const minutes = `${_m !== 0 ? `${_m} minute${_m > 1 ? "s" : ""} and ` : ""}`;
        const seconds = `${_s !== null ? `${_s} second${_s > 1 ? "s" : ""}` : ""}`;

        let server = this.props.data;

        server.totalRuntime = `${days}${hours}${minutes}${seconds}.`;

        this.props.update(server);
    }

    submitEndpoint = (e) => {
        e.preventDefault();

        let options = {
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(this.state.formData.endpoint)
        }

        request.post(`${SERVER}/api/string`, options, (err, res, body) => {
            if (res.statusCode !== 200) {
                const { error, reason } = JSON.parse(body);

                alert(`Error: ${error}\nReason: ${reason}`);
            } else {
                let temp = this.props.data;

                const endpoint = JSON.parse(body);

                for (const name of Object.keys(endpoint)) {
                    temp.strings[name] = endpoint[name];
                }

                this.props.update(temp);
            }
        });
    }

    deleteEndpoint = (e) => {
        let options = {
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                server: this.props.data.name,
                name: e
            })
        }

        request.delete(`${SERVER}/api/string`, options, (err, res, body) => {
            if (res.statusCode !== 200) {
                const { error, reason } = JSON.parse(body);

                alert(`Error: ${error}\nReason:${reason}`);
            } else {
                let temp = this.props.data;

                delete temp.strings[e];

                this.props.update(temp);
            }
        });
    }
}