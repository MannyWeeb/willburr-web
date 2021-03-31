import React from "react";

export class Navigator extends React.PureComponent {


    render() {
        return <nav className="navbar navbar-expand-md row px-0" id="navigator">
            <div className="col-xl-3 col-lg-4 col-md-12 col-sm-12 p-2 mr-2 mb-2">
                <center>
                    <p className="navbar-brand display-4 m-0 pointable" id="home-nav"  onClick={()=> this.props.navigateTo("home")}>Willburr-Web</p>
                </center>

                <center>
                    <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navItems">
                        <span className="fas fa-plus"></span>
                    </button>
                </center>
            </div>

            <div className="col-xl-9 col-lg-9 col-md-7 mx-2">

                <div className="collapse navbar-collapse" id="navItems">
                    <ul className="navbar-nav">
                        {/* <li className="nav-item">
                            <p className="nav-link display-4 pointable" id="view-nav" onClick={()=> this.props.navigateTo("view")}>View</p>
                        </li>

                        <li className="nav-item">
                            <p className="nav-link display-4 pointable" id="view-nav" onClick={()=> this.props.navigateTo("settings")}>Settings</p>
                        </li> */}
                    </ul>
                </div>
            </div>


        </nav>
    }

}