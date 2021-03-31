import React from "react";
import { SERVERADDR } from "../App";

export class Endpoint extends React.PureComponent {


    render() {
        const { name, port, mode } = this.props.data;

        return <li className="list-group-item bg-gray text-light list-group-item-action mb-2 px-2 py-2 endpoint-item">
            <div className="search-bg bg-dark">
                <a className="display-4 endpoint-name" href={`http://${SERVERADDR}:${port}/${name}`} target="_blank" rel="noreferrer">
                    <span className="fas fa-search mr-2"></span>
                    <b>{SERVERADDR}:{port}/{name}</b>
                </a>

                {mode === "delete" ? <div className="float-right" onClick={() => this.props.onDelete(name)}>
                    <svg className="fas fa-times red"></svg>
                </div> : ""}
            </div>
        </li>
    }
}