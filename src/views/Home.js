import React from "react";

export class Home extends React.PureComponent {

    render() {
        return <div className="p-3" id="home-panel">
            <center>
                <h3 className="display-4" id="app-title">Willburr</h3>
                <br />

                <div id="app-description">
                    <p>Willburr allows users to easily share mirrored copies of websites across a network.</p>
                    <br />



                    <p>Some other useful(niche) services that I made.</p>
                </div>

                <div className="card-deck" id="services-card-deck">
                    <div className="card" id="filehub-card">

                        <div className="card-body">

                            <p className="service-name text-center px-2 py-1 bg-dark" id="filehub-card-text">
                                <span className="text-light">File</span>
                                <span className="bg-orange">Hub</span>
                            </p>
                            <hr />

                            <p className="service-description">
                                Filehub is another service aimed on letting users share just about anything in their device across a network.
                            </p>
                        </div>
                        <div className="card-footer">
                            <center>
                                <h5 className="text-success">Enabled by default!</h5>
                            </center>
                            <a className="btn btn-outline-primary" href={`http://${window.location.host}/fh`} target="_blank" rel="noreferrer">Check it out.</a>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-body text-center">
                            <p className="service-name my-0 text-center px-1 py-1 text-light" id="smalltalk-card-text">
                                <span className="p-2 pr-3">Smalltalk<b>{">"}</b></span>
                            </p>
                            <hr />

                            <p className="service-description">
                                Smalltalk is a planned chat application emphasizing simplicity and functionality by allowing users
                            </p>
                        </div>
                        <div className="card-footer">

                            <center>
                                <h5 className="text-secondary">Planned.</h5>
                            </center>
                            <div className="btn-group">
                                <button className="btn btn-md btn-outline-primary" disabled>Read More</button>
                            </div>


                        </div>
                    </div>
                </div>

            </center>


            <h4 className="text-secondary mr-2" id="app-version">v1.0.0</h4>
        </div>
    }

}

