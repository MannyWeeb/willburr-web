/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";

import { Accordion, Alert, Badge, Button, ButtonGroup, Card, CardDeck, CardGroup, Col, Collapse, Container, FormControl, Jumbotron, ListGroup, Modal, ModalBody, ModalFooter, Nav, Navbar, Row, } from "react-bootstrap";
import ModalHeader from "react-bootstrap/esm/ModalHeader";
import { BrowserRouter as Router, Switch, Link, Route, } from "react-router-dom";

import serverRequests from "./utils/net";
import { getElapsed } from "./utils/utils";

const { getData, toggleServer, createServer, deleteServer, createString, deleteString } = serverRequests;

export default function App() {
    let [data, setData] = useState();
    const [error, setError] = useState();
    const [createServerResult, setCreateServerResult] = useState();
    const [modalVisible, setModalVisibility] = useState(false);

    useEffect(() => {
        getData()
            .catch(setError)
            .then(setData);
    }, [error]);

    let serverCards = [];

    if (data) {
        const { servers } = data

        serverCards = Object.values(servers).map((v) => {
            return <ServerCard key={v.name} value={v}
                onDelete={(name) => {
                    let svrs = data.servers;
                    delete svrs[name];
                    setData({
                        ...data,
                        servers: svrs
                    });
                }}
                onUpdate={(value) => {
                    let svrs = data.servers;
                    svrs[value.name] = value;
                    setData({
                        ...data,
                        servers: svrs
                    });
                }}
                onError={() => {
                    //Simply update appdata...
                    getData()
                        .catch(setError)
                        .then(setData);
                }}
            />
        });

        serverCards.push(<Card key={"create-server-card"} id="create-server-card">
            <Card.Body className="text-center">
                <h5 className="display-4 stretched-link pointable" id="create-server-link" onClick={() => setModalVisibility(true)}>Create-Server</h5>
                <span className="fas fa-plus-square" id="create-server-icon"></span>
            </Card.Body>

            <Modal show={modalVisible} onHide={() => {
                setCreateServerResult(null);
                setModalVisibility(false);
            }} centered>
                <ModalHeader>
                    <h2>Create new Server</h2>
                    {createServerResult ? <Alert variant={`${createServerResult.success ? "success" : "danger"}`}>
                        <span className={`fas fa-${createServerResult.success ? "check" : "exclamation"} mr-2`}></span>
                        {createServerResult.text}
                    </Alert> : ""}
                </ModalHeader>

                <form className="form-group" id="create-server-form" onSubmit={(e) => {
                    const [name, port] = e.target;
                    e.preventDefault();
                    createServer(name.value, port.value)
                        .catch((err) => {
                            setCreateServerResult({
                                success: false,
                                text: err
                            });
                        })
                        .then((v) => {
                            if (v) {
                                let { server } = v;
                                let svr = data.servers;
                                svr[server.name] = server;
                                setCreateServerResult({
                                    success: true,
                                    text: `Server ${server.name} Successfully created`
                                });
                                setData({
                                    ...data,
                                    servers: svr
                                });
                            }
                        });
                }}>
                    <ModalBody className="pb-0">
                        <FormControl className="my-2" type="text" size="lg" placeholder="Name" required />
                        <FormControl className="my-2" type="number" size="lg" placeholder="Port (0 to 65535)" min="0" max="65535" required />
                        <p className="text-secondary">Assigning globally available endpoints are only possible in the console for the meantime.</p>
                        <br />
                    </ModalBody>

                    <ModalFooter>
                        <button type="submit" className="btn btn-primary">Submit</button>
                    </ModalFooter>
                </form>
            </Modal>
        </Card>);
    }

    return <Router>
        <Navbar className="flex-column" expand>
            <Link className="navbar-brand m-0 p-0" id="home-nav" to={"/"}>
                <p className="display-4 m-0 p-0">
                    Willburr-Web
                </p>
                <center>
                    <sup id="app-version-container"><Badge className="ml-2" id="app-version" variant="secondary">v1.0.0</Badge></sup>
                </center>
            </Link>
            <Navbar.Toggle aria-controls="navbar" />
            <Navbar.Collapse>
                <Nav>
                    <CLink title="Servers" href="/servers" />
                    <CLink title="About" href="/about" />
                </Nav>
            </Navbar.Collapse>
        </Navbar>
        <Jumbotron id="main-panel">
            <Switch>
                <Route path="/" component={Home} exact />
                <Route path="/servers" exact>
                    {
                        error ? <center>
                            <Alert variant="danger">
                                <span className="fas fa-exclamation-triangle display-4"></span>
                                <h5 className="display-4">{error}</h5>
                                <br />

                                <div className="pointable" onClick={() => setError(null)}>
                                    <span className="fas fa-redo"></span>
                                    <h5>Retry</h5>
                                </div>
                            </Alert>
                        </center> :
                            serverCards.length !== 0 ? 
                                <div className="grid" data-masonry='{ "itemSelector": ".grid-item", "columnWidth": 200 }'>
                                
                                </div>
                                :
                                <center>
                                    <span className="display-1 text-center spinner-grow text-primary"></span>
                                    <p className="display-4">Loading...</p>
                                </center>
                    }
                </Route>
                <Route path="/about" component={About} exact />
                <Route path="/*" component={() => <center>
                    <span className="far fa-sad-tear display-4"></span>
                    <h2>404 Page not found.</h2>
                    <p>You seem to be lost.</p>
                </center>} />
            </Switch>
        </Jumbotron>
    </Router>
}

function ServerCard(props) {
    const [data, setData] = useState(props.value);
    const [error, setError] = useState(null);
    const [timer, setTimer] = useState();
    const [runtime, setRuntime] = useState();
    const [modal, setModal] = useState();
    const [addEndpoint, setAddEndpoint] = useState();
    const [endpointError, setEndpointError] = useState();

    const { name, port, status, startStamp, endStamp, totalVisits } = data;
    const strings = Object.entries(data.strings);
    const running = status === "running";

    useEffect(() => {
        if (data && running) {
            const _f = () => setRuntime(getElapsed(new Date(startStamp)));
            _f();
            setTimer(setInterval(_f, 1000));
        }
        return () => {
            if (timer) clearInterval(timer);
        }
    }, [data]);


    let stringsDocument = strings.length !== 0 ? strings.map(([str]) => {
        //const { directory, indexFile } = strings[str];
        const { protocol, hostname } = window.location;

        return <Container className="mb-2 border-light list-group-item list-group-item-action" fluid>
            <Row>
                <Col>
                    <a key={str} className="endpoint-link list-group-item" href={`${protocol}//${hostname}:${port}/${str}`} target="_blank" rel="noreferrer">
                        <span className="fas fa-search" />
                        <b className="endpoint-title text-secondary">{str}</b>
                    </a>
                </Col>
                <Col xl={1} lg={1} md={1} sm={1} xs={1}>
                    <div className="pointable" title={`Delete Endpoint ${str}?`} onClick={() => {
                        deleteString(str, name)
                            .catch(setError)
                            .then(() => {
                                let strings = data.strings;
                                delete strings[str];
                                props.onUpdate({ ...data, strings });
                            });
                    }}><span className="fas fa-trash red mr-2"></span></div>
                    <div onClick={() => {
                        alert("Available only on the CLI version...")
                    }}>
                        <span className="fas fa-edit pointable"></span>
                    </div>
                </Col>
            </Row>
        </Container>
    }) :
        [<h6 className="text-secondary text-center my-5">No endpoints found.</h6>]

    return <Card className="server-card">
        <Card.Header>
            <center>
                {error ? <Alert className="alert-danger">{error}</Alert> : ""}
                <h1 className="display-4">
                    {name}
                </h1>
                <span className="custom-control custom-switch server-ctrl">
                    <input type="checkbox" className="custom-control-input" id={`${name}-switch`} name="serverSwitch" checked={running} onChange={toggle} />
                    <label className="custom-control-label" htmlFor={`${name}-switch`}></label>
                </span>
            </center>

        </Card.Header>
        <Card.Body>
            <img className="server-card-img" src="http://localhost:3000/res/fontawesomeweb/svgs/solid/server.svg" alt="server-icon"></img>
            <h4 className="text-center">Server Information:</h4>
            <hr />
            <h5>Port: {port}</h5>
            <h5>Status: {status}</h5>
            <h5>
                {running ?
                    `Runtime: ${runtime ? runtime : "No data available..."}` :
                    `Last Run: ${endStamp ? new Date(endStamp).toLocaleDateString() : "Never"}`
                }
            </h5>
            <h5>Visits: {totalVisits}</h5>
        </Card.Body>

        <Card.Footer>
            <center>
                <Button variant="info" onClick={() => {
                    setModal(true);
                }}>More information</Button>
            </center>

            <Modal className="server-options" scrollable={true} show={modal} centered={true} onHide={() => {
                setAddEndpoint(false)
                setEndpointError(null);
                setModal(false);
            }}>
                <ModalBody>
                    <h4 className="text-center">Server Endpoints</h4>
                    <center><i>Click on an endpoint to navigate to it.</i></center>
                    <hr />
                    <ListGroup>
                        {stringsDocument}
                    </ListGroup>
                </ModalBody>

                <ModalFooter className="text-center">
                    <hr />
                    <h4>Server Options</h4>
                    <ButtonGroup className="server-options text-center" vertical>
                        <Button className="my-2" variant="primary" onClick={() => setAddEndpoint(!addEndpoint)}>
                            {addEndpoint ? "Cancel" : "Create Endpoint"}
                        </Button>
                        <Collapse id="create-endpoint-collapse" in={addEndpoint} >
                            <Container className="my-2 border border-light" fluid>
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    const [n, directory] = e.target
                                    createString(n.value, name, directory.value)
                                        .catch((err) => {
                                            setEndpointError({
                                                success: false,
                                                text: err
                                            });
                                        })
                                        .then((v) => {
                                            if (v) {
                                                let svr = data;
                                                svr.strings[n.value] = v;
                                                setEndpointError({
                                                    success: true,
                                                    text: `Endpoint successfully created`
                                                });
                                                props.onUpdate(svr);
                                            }
                                        });
                                }}>
                                    {endpointError ? <Alert variant={`${endpointError.success ? "success" : "danger"}`}>{endpointError.text}</Alert> : ""}
                                    <Row>
                                        <Col className="pr-1 my-2" xl={10} lg={10} md={10} sm={10}>
                                            <FormControl type="text" placeholder="Endpoint name" name="name" required />
                                            <FormControl id="endpoint-directory" type="text" placeholder="Directory content (relative to C:\My Web Site)" name="directory" required />
                                        </Col>
                                        <Col className="px-0 mx-0">
                                            <Button type="submit" className="py-2 span-content">
                                                Submit
                                            </Button>
                                        </Col>
                                    </Row>
                                </form>
                            </Container>
                        </Collapse>
                        <Button className="my-2 mt-1" variant="danger" onClick={() => {
                            if (running) {
                                alert(`Server ${name} is still running. Please close it first before proceeding`);
                            } else {
                                deleteServer(name)
                                    .catch(setError)
                                    .then(() => props.onDelete(name));
                            }
                        }}>Delete</Button>
                    </ButtonGroup>
                </ModalFooter>
            </Modal>
        </Card.Footer>
    </Card>

    function toggle(e) {
        const action = e.target.checked ? "run" : "stop";
        toggleServer(action, name)
            .catch((err) => {
                setError(err);
            })
            .then((data) => {
                if (data) {
                    setError(null);
                    setData(data);
                }
            });
    }
}

function Home() {
    return <div className="p-3" id="home-panel">
        <center>
            <div id="app-description">
                <p>Willburr allows users to easily share mirrored copies of websites across a network.</p>
                <br />
                <p>Some other useful(niche) services that I made.</p>
            </div>

            <Row id="services-card-deck">
                <Col xl={6} lg={6} md={6} sm={12} xs={12}>
                    <Card id="filehub-card">
                        <Card.Body>
                            <p className="service-name text-center px-2 py-1 bg-dark" id="filehub-card-text">
                                <span className="text-light">File</span>
                                <span className="bg-orange">Hub</span>
                            </p>
                            <hr />
                            <p className="service-description">
                                A web-app which allows users to easily share a folder across a network, it also allows preview of supported files directly within the browser.
                            </p>
                        </Card.Body>
                        <Card.Footer>
                            <a className="btn btn-outline-primary" href={`http://${window.location.host}/fh`} target="_blank" rel="noreferrer">Check it out.</a>
                        </Card.Footer>
                    </Card>
                </Col>
                <Col>
                <Card>
                    <Card.Body className="text-center">
                        <p className="service-name my-0 text-center px-1 py-1 text-light" id="smalltalk-card-text">
                            <span className="p-2 pr-3">Smalltalk<b>{">"}</b></span>
                        </p>
                        <hr />
                        <p className="service-description">
                            Smalltalk is a planned chat application emphasizing simplicity and functionality.
                        </p>
                    </Card.Body>
                    <Card.Footer className="text-center">
                        <h5 className="text-secondary">Planned.</h5>
                        <div className="btn-group">
                            <button className="btn btn-md btn-outline-primary" disabled>Read More</button>
                        </div>
                    </Card.Footer>
                </Card>
                </Col>
            </Row>
        </center>
    </div>
}

function About() {
    return <Container id="about-panel">
        <h2 id="about-title">About the Willburr Suite.</h2>

        <Accordion defaultActiveKey="1">
            {/* <Accordion.Item eventKey="0">
                <Accordion.Header>What is this "Willburr Suite"?</Accordion.Header>
                <Accordion.Body>
                    It is a set of applications that revolves around sharing files, folders, and even to complete static mirrors of websites on a local network.
                </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="1">
                <Accordion.Header>What compelling reasons would I have to use this app.</Accordion.Header>
                <Accordion.Body>
                    Easily deployable: Does not require a lot of boilerplate setup, just run "npm run web-dev" and you're good to go.
                    Less Hassle: No more complicated homegroup or ftp setups or learning how to operate third party apps that offers the same feature.
                    Mobile Friendly: All tools in this suite are accessible across all modern devices.
                </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="2">
                <Accordion.Header>Will there be any future updates?</Accordion.Header>
            </Accordion.Item> */}
        </Accordion>

        <p>
            One characteristic that most apps from this set shares is their simplicity, "Form over Functionality" and small memory footprint.
        </p>
    </Container>
}

//Smol
function CLink(prop) {
    return <Link key={prop.title.toLowerCase()} className="nav-link display-4" role="button" to={prop.href} {...prop}>
        {prop.title}
    </Link>
}